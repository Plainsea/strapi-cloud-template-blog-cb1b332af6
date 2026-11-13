'use strict';

/**
 * glossary-term service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::glossary-term.glossary-term');
