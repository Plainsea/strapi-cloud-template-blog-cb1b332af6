'use strict';

/**
 * tombola controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::tombola.tombola', ({ strapi }) => ({

  // GET /api/tombola/winners — връща вече изтеглените победители (или празен масив)
  async getWinners(ctx) {
    const winners = await strapi.documents('api::tombola.tombola').findMany({
      filters: { IsWinner: true },
      fields: ['Name', 'Email', 'Company'],
    });
    return ctx.send({ data: winners, drawn: winners.length > 0 });
  },

  // POST /api/tombola/winners — тегли 3 победители и ги запазва (ако вече са изтеглени, връща тях)
  async drawWinners(ctx) {
    const existing = await strapi.documents('api::tombola.tombola').findMany({
      filters: { IsWinner: true },
      fields: ['Name', 'Email', 'Company'],
    });

    if (existing.length > 0) {
      return ctx.send({ data: existing, drawn: true });
    }

    const all = await strapi.documents('api::tombola.tombola').findMany({
      fields: ['Name', 'Email', 'Company'],
    });

    if (!all || all.length === 0) {
      return ctx.send({ data: [], drawn: false });
    }

    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(3, shuffled.length));

    await Promise.all(
      chosen.map((entry) =>
        strapi.documents('api::tombola.tombola').update({
          documentId: entry.documentId,
          data: { IsWinner: true },
        })
      )
    );

    return ctx.send({ data: chosen, drawn: true });
  },

  // DELETE /api/tombola/winners — ресетира всички победители
  async resetWinners(ctx) {
    const winners = await strapi.documents('api::tombola.tombola').findMany({
      filters: { IsWinner: true },
      fields: ['documentId'],
    });

    await Promise.all(
      winners.map((entry) =>
        strapi.documents('api::tombola.tombola').update({
          documentId: entry.documentId,
          data: { IsWinner: false },
        })
      )
    );

    return ctx.send({ ok: true, reset: winners.length });
  },

}));
