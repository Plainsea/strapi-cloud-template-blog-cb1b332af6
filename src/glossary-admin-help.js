'use strict';

// Help text shown under each Glossary Term field in the admin edit form.
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
