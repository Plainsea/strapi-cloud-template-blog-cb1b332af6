'use strict';

// Articles used to keep their text in a `blocks` dynamiczone holding one
// shared.rich-text component. The text now lives in the plain `body` field.
// This copies blocks[0].body into `body` for every article row (drafts and
// published rows alike) whose `body` is still empty, so it is safe to run on
// every startup: once a row has a body it is skipped.
//
// `blocks` stays in the schema (hidden from the admin form) until the
// frontend reads `body`, so no existing data is dropped by this deploy.
async function migrateArticleBody(strapi) {
  const articles = await strapi.db.query('api::article.article').findMany({
    select: ['id', 'body'],
    populate: { blocks: true },
  });

  let migrated = 0;

  for (const article of articles) {
    if (article.body) {
      continue;
    }

    const richText = (article.blocks || []).find(
      (block) => block.__component === 'shared.rich-text' && block.body
    );

    if (!richText) {
      continue;
    }

    await strapi.db.query('api::article.article').update({
      where: { id: article.id },
      data: { body: richText.body },
    });
    migrated++;
  }

  if (migrated > 0) {
    strapi.log.info(`Migrated ${migrated} article row(s) from blocks to body`);
  }
}

module.exports = migrateArticleBody;
