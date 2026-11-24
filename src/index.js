'use strict';
const bootstrap = require("./bootstrap");
const migrateArticleBody = require("./migrate-article-body");
const setGlossaryAdminHelp = require("./glossary-admin-help");
const setAdminListViews = require("./admin-list-views");
const registerHomeDashboard = require("./home-dashboard");
const ensurePublicRead = require("./public-read");

module.exports = {
  register({ strapi }) {
    registerHomeDashboard(strapi);
  },

  async bootstrap({ strapi }) {
    await migrateArticleBody(strapi);
    await setGlossaryAdminHelp(strapi);
    await setAdminListViews(strapi);
    await ensurePublicRead(strapi);
    await bootstrap();
  },
};
