'use strict';

// Help text shown under the Glossary Term, Comparison and Trust page fields in the admin edit form.
//
// Strapi keeps these descriptions in the database (the Content Manager's
// "Configure the view" settings), not in schema.json, so text typed there by
// hand would exist only in the environment it was typed in. Setting it here on
// every startup keeps local and Strapi Cloud the same and keeps the text in git.
// Only `description` (and `placeholder` where given) is written; labels, field
// order and every other view setting stay as editors left them.

const HELP = {
  'api::glossary-term.glossary-term': {
    title: {
      description: 'Full name of the term, e.g. "Penetration Testing as a Service".',
    },
    slug: {
      description: 'Page address: plainsea.com/glossary/<slug>. Required to publish. Keep it short; do not change it once published.',
      placeholder: 'e.g. ptaas',
    },
    abbreviation: {
      description: 'Short form, if there is one (PTaaS, CVSS). Otherwise leave empty.',
      placeholder: 'e.g. PTaaS',
    },
    shortDefinition: {
      description: '1-2 sentences: what is it? Shown in the list, in Google and to AI assistants.',
    },
    isPillar: {
      description: 'On only for key topics like PTaaS. Shown first, with a full page layout.',
    },
    linkTo: {
      description: 'Only if another page on the site already covers this term. The glossary then links there instead.',
      placeholder: 'e.g. /ai-penetration-testing',
    },
    body: {
      description: 'The full explanation, ideally 400+ words. Very short pages rarely show in Google.',
    },
    blocks: {
      description: 'Optional extra sections after the text. Mainly for key topics.',
    },
    faq: {
      description: 'Common questions with short answers. Can show directly in Google results.',
    },
    relatedTerms: {
      description: 'Terms to link at the bottom of the page.',
    },
    cover: {
      description: 'Optional. Used for LinkedIn and X shares and on the Key topics card.',
    },
    showCoverOnPage: {
      description: 'Turn on to also show the cover image at the top of the term page.',
    },
    seoTitle: {
      description: 'Title in Google, up to ~60 characters. If empty, the term title is used.',
    },
    seoDescription: {
      description: 'Text in Google, up to ~155 characters. If empty, the short definition is used.',
    },
  },
  'api::comparison.comparison': {
    title: {
      description: 'The page heading, e.g. "Pentera vs Plainsea".',
    },
    slug: {
      description: 'Page address: plainsea.com/compare/<slug>. Required to publish. Do not change it once published.',
      placeholder: 'e.g. pentera-vs-plainsea',
    },
    kind: {
      description: 'Vendor: another product compared with Plainsea. Approach: two ways of testing, e.g. automated vs manual.',
    },
    optionA: {
      description: 'Vendor pages: the other product, e.g. "Pentera". Approach pages: the first approach.',
    },
    optionB: {
      description: 'Vendor pages: always "Plainsea". Approach pages: the second approach.',
    },
    summary: {
      description: '2-3 sentences: which to choose and when. Shown first on the page, in Google and to AI assistants.',
    },
    rows: {
      description: 'The comparison table. One row per criterion, e.g. "How often it runs".',
    },
    whenToChooseA: {
      description: 'When the first option is the better choice. Be fair: a balanced page is more convincing.',
    },
    whenToChooseB: {
      description: 'When the second option is the better choice.',
    },
    plainseaFit: {
      description: 'Approach pages only, optional: a short paragraph on where Plainsea fits. Not shown on vendor pages.',
    },
    body: {
      description: 'Optional. Longer explanation shown after the table.',
    },
    faq: {
      description: 'Common questions with short answers. Also sent to Google as FAQ data.',
    },
    sources: {
      description: 'Where the facts come from. Needed for any claim about another product.',
    },
    lastReviewed: {
      description: 'The day you last checked every fact on this page. Shown as "Last reviewed".',
    },
    cover: {
      description: 'Optional. Used for LinkedIn and X shares.',
    },
    seoTitle: {
      description: 'Title in Google, up to ~60 characters. If empty, the title is used.',
    },
    seoDescription: {
      description: 'Text in Google, up to ~155 characters. If empty, the summary is used.',
    },
  },
  'api::trust-page.trust-page': {
    title: { description: 'The page heading, e.g. "Trust and security".' },
    intro: {
      description: '1-2 sentences under the heading. Also used in Google and by AI assistants when SEO description is empty.',
    },
    certifications: {
      description: 'Only certifications and reports we hold ourselves. Write "SOC 2 Type II", never "SOC 2 certified" or "compliant".',
    },
    sections: {
      description: 'One section per topic, e.g. "How we protect customer data" or "How AI agents are controlled".',
    },
    documentRequest: {
      description: 'The box asking visitors to request the SOC 2 report or a security questionnaire.',
    },
    faq: { description: 'Common security questions with short answers. Also sent to Google as FAQ data.' },
    lastUpdated: { description: 'The day you last checked every fact on this page. Shown as "Last updated".' },
    seoTitle: { description: 'Title in Google, up to ~60 characters. If empty, "<title> | Plainsea" is used.' },
    seoDescription: { description: 'Text in Google, up to ~155 characters. If empty, the intro is used.' },
  },
  'api::case-study.case-study': {
    title: { description: 'The story headline, exactly as the customer approved it.' },
    slug: {
      description: 'Page address: plainsea.com/case-studies/<slug>. Required to publish. Do not change it once published.',
      placeholder: 'e.g. ovation-incentives',
    },
    customerName: { description: 'The company name, e.g. "Ovation Incentives".' },
    customerLogo: {
      description: 'Only with the customer\'s written permission. SVG or transparent PNG.',
    },
    logoOnLightBackground: {
      description: 'On: the logo sits on a white tile, for dark or coloured logos. Turn off only for a white logo made for dark backgrounds.',
    },
    customerWebsite: {
      description: 'Optional: the customer\'s site (https://...). Not shown on the page, only told to Google. To link it on the page, link the name in the text.',
    },
    industry: { description: 'Optional, short, e.g. "Rewards and incentives". Shown on the case study card.' },
    storyDate: { description: 'The date shown on the story. Also sorts the list, newest first.' },
    summary: {
      description: 'Optional, 1-2 sentences for the case studies list. If empty, the first highlight is shown instead.',
    },
    quote: { description: 'The main quote shown at the top, with its attribution, as the customer wrote it.' },
    screenshot: {
      description: 'Optional: a screenshot of the customer\'s site or product, with their permission. Shown on the story page in a browser frame. Wide images (16:9 or 16:10) look best.',
    },
    highlights: {
      description: 'Up to 3 headline results shown at the top. Value is the big text ("~2 hours"), caption the small text under it.',
    },
    atAGlance: { description: 'The "At a glance" facts, e.g. Customer, Founded, Challenge, Results.' },
    body: {
      description: 'The full story as the customer approved it. Use ## for section headings and > for quotes.',
    },
    people: {
      description: 'People quoted in the story, with their LinkedIn profile. Upload the photo here: LinkedIn photos cannot be loaded automatically.',
    },
    cover: { description: 'Optional. Used for LinkedIn and X shares.' },
    seoTitle: { description: 'Title in Google, up to ~60 characters. If empty, the title is used.' },
    seoDescription: { description: 'Text in Google, up to ~155 characters. If empty, the summary is used.' },
  },
  'elements.highlight': {
    label: { description: 'Optional small label above, e.g. "Time per test".' },
    value: { description: 'The big text, e.g. "~2 hours".' },
    caption: { description: 'Optional small text under it, e.g. "instead of 1+ day per test".' },
  },
  'elements.person': {
    name: { description: 'Full name, e.g. "Ceno Milov".' },
    role: { description: 'Job title and company, e.g. "IT Manager, Ovation Incentives".' },
    linkedinUrl: { description: 'Their LinkedIn profile: https://www.linkedin.com/in/...' },
    photo: { description: 'Square photo, with the person\'s permission. Save it from LinkedIn or ask them for one.' },
  },
  'elements.certification': {
    name: { description: 'Exact name, e.g. "ISO/IEC 27001" or "SOC 2 Type II".' },
    issuer: { description: 'Who issued or audited it, e.g. "DNV". Leave empty if unsure.' },
    description: { description: 'One sentence: what it covers.' },
    badge: { description: 'The certification logo.' },
    link: { description: 'Optional: a certificate page or news post (https://... or /news/...).' },
  },
  'elements.trust-section': {
    title: { description: 'Section heading, e.g. "How we protect customer data".' },
    icon: { description: 'Optional icon next to the heading.' },
    body: { description: 'Short paragraphs or a list. Only facts we can back up.' },
  },
  'elements.comparison-row': {
    criterion: { description: 'What is compared, e.g. "Proof of exploitability".' },
    optionA: { description: 'How the first option does on this point. One short sentence.' },
    optionB: { description: 'How the second option does on this point.' },
  },
  'elements.source-link': {
    label: { description: 'What the source is, e.g. "NIST SP 800-115".' },
    url: { description: 'Full link (https://...) or a page on this site (/glossary/ptaas).' },
  },
  'elements.faq-item': {
    question: {
      description: 'As people would ask it, e.g. "How is PTaaS different from a pentest?"',
    },
    answer: {
      description: '2-4 sentences. Answer first, then details.',
    },
  },
};

async function applyHelp(service, model, fields) {
  const configuration = await service.findConfiguration(model);
  const { metadatas = {} } = configuration;
  let changed = false;

  for (const [field, help] of Object.entries(fields)) {
    const edit = metadatas[field]?.edit;
    if (!edit) continue;

    for (const [key, value] of Object.entries(help)) {
      if (edit[key] !== value) {
        edit[key] = value;
        changed = true;
      }
    }
  }

  if (changed) {
    // uid (and, for components, category) are added by findConfiguration, not stored.
    const { uid, category, ...rest } = configuration;
    await service.updateConfiguration(model, rest);
  }
}

async function setGlossaryAdminHelp(strapi) {
  const contentManager = strapi.plugin('content-manager');

  for (const [uid, fields] of Object.entries(HELP)) {
    const isComponent = !uid.startsWith('api::');
    const model = isComponent ? strapi.components[uid] : strapi.contentTypes[uid];
    if (!model) continue;

    const service = contentManager.service(isComponent ? 'components' : 'content-types');
    await applyHelp(service, model, fields);
  }
}

module.exports = setGlossaryAdminHelp;
