'use strict';
const bootstrap = require("./bootstrap");
const migrateArticleBody = require("./migrate-article-body");
const setGlossaryAdminHelp = require("./glossary-admin-help");
const setAdminListViews = require("./admin-list-views");

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    await migrateArticleBody(strapi);
    await setGlossaryAdminHelp(strapi);
    await setAdminListViews(strapi);
    await bootstrap();
  },
};
