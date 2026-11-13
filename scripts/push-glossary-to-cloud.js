'use strict';

/**
 * Copies glossary terms from a local Strapi to Strapi Cloud, through the REST API.
 *
 * It only creates or updates glossary terms (and uploads their cover images).
 * It never deletes anything in Cloud.
 *
 *   node scripts/push-glossary-to-cloud.js            dry run: shows what would happen
 *   node scripts/push-glossary-to-cloud.js --apply    writes to Cloud
 *   add --update                                       also overwrite terms that already exist in Cloud
 *
 * Settings come from .env (git-ignored) or the environment:
 *   CLOUD_STRAPI_TOKEN  API token from the Cloud admin (Settings > API Tokens), with access to
 *                       Glossary-term (find, findOne, create, update) and Upload. Required.
 *   CLOUD_STRAPI_URL    default: https://better-laughter-bd20a7fa5b.strapiapp.com
 *   LOCAL_STRAPI_URL    default: http://127.0.0.1:1337 (local Strapi must be running)
 *
 *   LOCAL_STRAPI_TOKEN  optional API token for the local Strapi. Without it, terms are read through
 *                       the public API, which only returns published terms (drafts are hidden from
 *                       public requests by src/middlewares/public-published-only.js).
 *
 * Without LOCAL_STRAPI_TOKEN, the Public role locally needs find and findOne on Glossary-term.
 */

const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  // No .env file: rely on the environment.
}

const APPLY = process.argv.includes('--apply');
const UPDATE = process.argv.includes('--update');
// 127.0.0.1, not localhost: Node may resolve localhost to IPv6, which Strapi does not listen on.
const LOCAL = (process.env.LOCAL_STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '');
const CLOUD = (process.env.CLOUD_STRAPI_URL || 'https://better-laughter-bd20a7fa5b.strapiapp.com').replace(/\/$/, '');
const TOKEN = process.env.CLOUD_STRAPI_TOKEN;
const LOCAL_TOKEN = process.env.LOCAL_STRAPI_TOKEN;

const API = '/api/glossary-terms';

// Plain fields copied as they are. Relations, media and components are handled separately.
const FIELDS = [
  'title', 'slug', 'abbreviation', 'shortDefinition', 'isPillar', 'linkTo',
  'body', 'showCoverOnPage', 'seoTitle', 'seoDescription',
];

const LOCAL_QUERY =
  'populate[faq]=true&populate[cover]=true&populate[relatedTerms][fields][0]=slug' +
  '&populate[blocks]=true&pagination[pageSize]=100';

async function request(base, url, { method = 'GET', body, token, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + url, { method, headers, body: form || (body && JSON.stringify(body)) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = json?.error?.message || text || res.statusText;
    throw new Error(`${method} ${base}${url} failed (${res.status}): ${message}`);
  }
  return json;
}

/** All local terms: published ones, plus drafts that were never published (only with LOCAL_STRAPI_TOKEN). */
async function readLocalTerms() {
  const published = (await request(LOCAL, `${API}?${LOCAL_QUERY}`, { token: LOCAL_TOKEN })).data;
  if (!LOCAL_TOKEN) {
    console.log('  (no LOCAL_STRAPI_TOKEN: only published local terms are read, drafts are skipped)\n');
    return published.map((t) => ({ ...t, publish: true }));
  }
  const drafts = (await request(LOCAL, `${API}?${LOCAL_QUERY}&status=draft`, { token: LOCAL_TOKEN })).data;
  const publishedSlugs = new Set(published.map((t) => t.slug));
  return [
    ...published.map((t) => ({ ...t, publish: true })),
    ...drafts.filter((t) => !publishedSlugs.has(t.slug)).map((t) => ({ ...t, publish: false })),
  ];
}

/** Cloud terms by slug, drafts included. */
async function readCloudTerms() {
  const bySlug = new Map();
  for (const status of ['published', 'draft']) {
    const res = await request(CLOUD, `${API}?fields[0]=slug&pagination[pageSize]=100&status=${status}`, { token: TOKEN });
    for (const t of res.data) if (!bySlug.has(t.slug)) bySlug.set(t.slug, t.documentId);
  }
  return bySlug;
}

/** Downloads a local cover and uploads it to Cloud; returns the new file id. */
async function uploadCover(cover) {
  const src = cover.url.startsWith('http') ? cover.url : LOCAL + cover.url;
  const file = await fetch(src);
  if (!file.ok) throw new Error(`Could not download cover ${src} (${file.status})`);
  const form = new FormData();
  form.append('files', new Blob([await file.arrayBuffer()], { type: cover.mime }), cover.name);
  form.append('fileInfo', JSON.stringify({ name: cover.name, alternativeText: cover.alternativeText || null }));
  const [uploaded] = await request(CLOUD, '/api/upload', { method: 'POST', token: TOKEN, form });
  return uploaded.id;
}

function dataFor(term) {
  const data = {};
  for (const f of FIELDS) if (term[f] !== undefined) data[f] = term[f];
  data.faq = (term.faq || []).map(({ question, answer }) => ({ question, answer }));
  return data;
}

(async () => {
  if (!TOKEN) {
    console.error('CLOUD_STRAPI_TOKEN is missing. Add it to .env (git-ignored), then run again.');
    process.exit(1);
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${LOCAL} -> ${CLOUD}${UPDATE ? ' (update existing)' : ''}\n`);

  const terms = await readLocalTerms();
  const cloud = await readCloudTerms();
  const plan = terms.map((t) => ({ term: t, existing: cloud.get(t.slug) }));

  for (const { term, existing } of plan) {
    const action = !existing ? 'create' : UPDATE ? 'update' : 'skip (exists)';
    const extras = [
      term.publish ? 'published' : 'draft',
      term.cover ? 'with cover' : null,
      term.faq?.length ? `${term.faq.length} FAQ` : null,
      term.relatedTerms?.length ? `${term.relatedTerms.length} related` : null,
    ].filter(Boolean).join(', ');
    console.log(`  ${action.padEnd(14)} ${term.slug}  (${extras})`);
    if (term.blocks?.length) console.log(`  ${''.padEnd(14)} ! has page-builder blocks: not copied, add them in the Cloud admin`);
  }

  const toWrite = plan.filter((p) => !p.existing || UPDATE);
  console.log(`\n${terms.length} local terms, ${cloud.size} already in Cloud, ${toWrite.length} to write.`);

  if (!APPLY) {
    console.log('Nothing was written. Run again with --apply to copy them.');
    return;
  }

  // Pass 1: create or update each term with its fields, FAQ and cover.
  const cloudIds = new Map(cloud);
  for (const { term, existing } of toWrite) {
    const data = dataFor(term);
    if (term.cover) data.cover = await uploadCover(term.cover);
    const status = term.publish ? '' : '?status=draft';
    const res = existing
      ? await request(CLOUD, `${API}/${existing}${status}`, { method: 'PUT', token: TOKEN, body: { data } })
      : await request(CLOUD, `${API}${status}`, { method: 'POST', token: TOKEN, body: { data } });
    cloudIds.set(term.slug, res.data.documentId);
    console.log(`  ${existing ? 'updated' : 'created'} ${term.slug}`);
  }

  // Pass 2: related terms, now that every term exists in Cloud.
  for (const { term } of toWrite) {
    const related = (term.relatedTerms || []).map((r) => cloudIds.get(r.slug)).filter(Boolean);
    if (!related.length) continue;
    const status = term.publish ? '' : '?status=draft';
    await request(CLOUD, `${API}/${cloudIds.get(term.slug)}${status}`, {
      method: 'PUT', token: TOKEN, body: { data: { relatedTerms: { set: related.map((documentId) => ({ documentId })) } } },
    });
    console.log(`  linked ${term.slug} -> ${related.length} related`);
  }

  console.log('\nDone.');
})().catch((e) => {
  console.error(`\n${e.message}`);
  process.exit(1);
});
