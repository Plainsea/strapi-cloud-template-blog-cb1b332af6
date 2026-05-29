'use strict';

/**
 * tombola controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::tombola.tombola', ({ strapi }) => ({
  async winners(ctx) {
    const entries = await strapi.documents('api::tombola.tombola').findMany({
      status: 'published',
      fields: ['Name', 'Email', 'Company'],
    });

    if (!entries || entries.length === 0) {
      return ctx.send({ data: [] });
    }

    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, Math.min(3, shuffled.length));

    return ctx.send({ data: winners });
  },
}));
