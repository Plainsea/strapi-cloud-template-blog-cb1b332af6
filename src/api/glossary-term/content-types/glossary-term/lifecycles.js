'use strict';

const { errors } = require('@strapi/utils');


const PLACEHOLDER = /^glossary-term(-\d+)?$/;

function checkSlug(slug, isPublishing) {
  const value = typeof slug === 'string' ? slug.trim() : slug;

  if (value && PLACEHOLDER.test(value)) {
    throw new errors.ApplicationError(
      `"${value}" is a placeholder, not a real slug. Write a short address for this term, e.g. "ptaas" or "attack-surface".`
    );
  }

  if (isPublishing && !value) {
    throw new errors.ApplicationError(
      'Fill in the slug before publishing. It becomes the page address: plainsea.com/glossary/<slug>.'
    );
  }
}

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    checkSlug(data.slug, Boolean(data.publishedAt));
  },

  beforeUpdate(event) {
    const { data } = event.params;
    if ('slug' in data) checkSlug(data.slug, Boolean(data.publishedAt));
  },
};
