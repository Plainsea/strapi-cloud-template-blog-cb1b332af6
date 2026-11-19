'use strict';

const SITE_URL = (process.env.PLAINSEA_SITE_URL || 'https://plainsea.com').replace(/\/$/, '');
const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 155;
const STALE_DRAFT_DAYS = 14;
const LONG_DASH = /[–—]/;

const BANNED_WORDS = /\b(compliant|re-?test(?:s|ed|ing)?|delta[ -]testing|active directory)\b/i;
const ARTICLE_ROUTES = ['blog', 'news'];
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]'];

const ownPage = (d) => !d.linkTo?.trim();

const TYPES = [
  {
    key: 'article',
    uid: 'api::article.article',
    label: 'Article',
    fields: ['title', 'slug', 'description', 'seoTitle', 'seoDescription', 'body', 'dateAdded', 'createdAt', 'publishedAt'],
    populate: { cover: { fields: ['id'] }, category: { fields: ['name', 'slug'] }, blocks: true },
    // The date the article shows on the site; createdAt for older entries without one.
    added: (d) => d.dateAdded || d.createdAt,
    path: (d) => (ARTICLE_ROUTES.includes(d.category?.slug) && d.slug ? `/${d.category.slug}/${d.slug}` : null),
    seo: true,
  },
  {
    key: 'glossary',
    uid: 'api::glossary-term.glossary-term',
    label: 'Glossary',
    fields: ['title', 'slug', 'abbreviation', 'shortDefinition', 'isPillar', 'seoTitle', 'seoDescription', 'body', 'linkTo', 'createdAt', 'publishedAt'],
    populate: { relatedTerms: { fields: ['title'] }, faq: true, blocks: true, cover: { fields: ['id'] } },
    added: (d) => d.createdAt,
    // Terms with linkTo point at another page and have none of their own.
    path: (d) => (ownPage(d) ? `/glossary/${d.slug}` : d.linkTo.trim().startsWith('/') ? d.linkTo.trim() : '/glossary'),
    seo: true,
  },
  {
    key: 'useCase',
    uid: 'api::use-case.use-case',
    label: 'Use case',
    fields: ['title', 'slug', 'summary', 'seoTitle', 'seoDescription', 'createdAt', 'publishedAt'],
    populate: { blocks: true },
    added: (d) => d.createdAt,
    path: (d) => (d.slug ? `/use-cases/${d.slug}` : null),
    seo: true,
  },
  {
    key: 'testimonial',
    uid: 'api::testimonial.testimonial',
    label: 'Testimonial',
    fields: ['authorName', 'companyName', 'quote', 'createdAt', 'publishedAt'],
    populate: {},
    added: (d) => d.createdAt,
    path: () => null,
    seo: false,
  },
];

const editUrl = (uid, documentId) => `/content-manager/collection-types/${uid}/${documentId}`;

const titleOf = (d) => d.title || [d.authorName, d.companyName].filter(Boolean).join(', ') || 'Untitled';

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);


const sectionOf = (type, d) => (type.key === 'article' ? capitalise(d.category?.name || 'article') : type.label);

const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

async function load(strapi, type, status) {
  return strapi.documents(type.uid).findMany({
    status,
    fields: [...type.fields, 'updatedAt'],
    populate: type.populate,
    limit: 1000,
  });
}

async function buildDashboard(strapi, { showUseCases }) {
  const now = new Date();
  const daysSince = (d) => Math.floor((now - new Date(d.updatedAt ?? d.createdAt)) / 86400000);
  const thisMonth = monthKey(now);

  const counts = {};
  const recent = [];
  const waiting = [];
  const index = [];
  const pillarIds = new Set();
  const termLinks = new Map();
  const termsWithPage = [];
  const checks = {
    seoDescriptionTooLong: [],
    seoTitleTooLong: [],
    seoMissing: [],
    bannedWords: [],
    longDash: [],
    articleWithoutCover: [],
    termWithoutRelated: [],
    termWithoutFaq: [],
    termWithoutCover: [],
    termWithoutTopic: [],
    staleDraft: [],
  };

  for (const type of TYPES.filter((t) => showUseCases || t.key !== 'useCase')) {
    const [published, drafts] = await Promise.all([load(strapi, type, 'published'), load(strapi, type, 'draft')]);
    const publishedById = new Map(published.map((d) => [d.documentId, d]));
    const unpublished = drafts.filter((d) => !publishedById.has(d.documentId));
    // Published entries whose draft has been saved since: changes that are not live yet.
    const changed = drafts.filter((d) => {
      const live = publishedById.get(d.documentId);
      return live && new Date(d.updatedAt) - new Date(live.updatedAt) > 1000;
    });

    const item = (d) => ({
      type: type.key,
      section: sectionOf(type, d),
      title: titleOf(d),
      url: editUrl(type.uid, d.documentId),
    });

    const bySection = {};
    for (const d of published) {
      const section = sectionOf(type, d);
      bySection[section] = (bySection[section] ?? 0) + 1;
    }

    counts[type.key] = {
      published: published.length,
      drafts: unpublished.length,

      draftIds: unpublished.map((d) => d.documentId),
      addedThisMonth: published.filter((d) => monthKey(type.added(d)) === thisMonth).length,
      bySection,

      pillars: published.filter((d) => d.isPillar).length,
      oldestDraftDays: unpublished.reduce((max, d) => Math.max(max, daysSince(d)), 0),
    };

    for (const d of published) {
      const path = type.path(d);
      const linked = { ...item(d), siteUrl: path ? `${SITE_URL}${path}` : null };

      recent.push({ ...linked, publishedAt: d.publishedAt });
      index.push({ ...linked, abbreviation: d.abbreviation?.trim() || null, status: 'published' });

      const hasPage = type.key !== 'glossary' || ownPage(d);

      if (type.seo && hasPage) {
        const description = (d.seoDescription ?? '').trim();
        const title = (d.seoTitle ?? '').trim();
        if (description.length > SEO_DESCRIPTION_MAX) {
          checks.seoDescriptionTooLong.push({ ...linked, detail: `${description.length} characters` });
        }
        if (title.length > SEO_TITLE_MAX) checks.seoTitleTooLong.push({ ...linked, detail: `${title.length} characters` });
        const missing = [!title && 'title', !description && 'description'].filter(Boolean);
        if (missing.length) checks.seoMissing.push({ ...linked, detail: `No ${missing.join(' or ')}` });
      }

      const text = JSON.stringify(d);
      const banned = text.match(BANNED_WORDS);
      if (banned) checks.bannedWords.push({ ...linked, detail: `"${banned[0]}"` });
      if (LONG_DASH.test(text)) checks.longDash.push(linked);
      if (type.key === 'article' && !d.cover) checks.articleWithoutCover.push(linked);

      if (type.key === 'glossary') {
        termLinks.set(d.documentId, (d.relatedTerms ?? []).map((t) => t.documentId));
        if (d.isPillar) pillarIds.add(d.documentId);
        if (hasPage) {
          termsWithPage.push({ documentId: d.documentId, isPillar: Boolean(d.isPillar), linked });
          if (!(d.relatedTerms ?? []).length) checks.termWithoutRelated.push(linked);
          if (!(d.faq ?? []).length) checks.termWithoutFaq.push(linked);
          if (!d.cover) checks.termWithoutCover.push(linked);
        }
      }
    }

    for (const d of unpublished) {
      const days = daysSince(d);
      index.push({ ...item(d), siteUrl: null, abbreviation: d.abbreviation?.trim() || null, status: 'draft' });
      waiting.push({ ...item(d), state: 'Draft', updatedAt: d.updatedAt });
      if (days > STALE_DRAFT_DAYS) checks.staleDraft.push({ ...item(d), detail: `${days} days` });
    }
    for (const d of changed) {
      waiting.push({ ...item(d), state: 'Changes not published', updatedAt: d.updatedAt });
    }
  }



  if (pillarIds.size) {
    for (const term of termsWithPage) {
      if (term.isPillar) continue;
      const linksToPillar = (termLinks.get(term.documentId) ?? []).some((id) => pillarIds.has(id));
      const pillarLinksHere = [...pillarIds].some((id) => (termLinks.get(id) ?? []).includes(term.documentId));
      if (!linksToPillar && !pillarLinksHere) checks.termWithoutTopic.push(term.linked);
    }
  }

  recent.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  waiting.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  index.sort((a, b) => a.title.localeCompare(b.title));

  return {
    siteUrl: SITE_URL,
    showUseCases,
    counts,
    recent: recent.slice(0, 6),
    waiting,
    index,
    checks,
    limits: { seoTitleMax: SEO_TITLE_MAX, seoDescriptionMax: SEO_DESCRIPTION_MAX, staleDraftDays: STALE_DRAFT_DAYS },
  };
}

module.exports = function registerHomeDashboard(strapi) {
  strapi.server.routes({
    type: 'admin',
    prefix: '/plainsea',
    routes: [
      {
        method: 'GET',
        path: '/home-dashboard',
        handler: async (ctx) => {
          // Use cases are not live yet, so the dashboard shows them only on a local Strapi.
          ctx.body = await buildDashboard(strapi, { showUseCases: LOCAL_HOSTS.includes(ctx.hostname) });
        },
        config: { policies: ['admin::isAuthenticatedAdmin'] },
      },
    ],
  });
};
