'use strict';
const bootstrap = require("./bootstrap");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // New articles start with one empty rich-text block already in `blocks`,
    // so editors land on an editable block instead of an empty dynamiczone
    // they have to click "Add a component" on. Only fires on create, so
    // existing articles and their blocks are untouched.
    strapi.documents.use((context, next) => {
      if (context.uid !== 'api::article.article' || context.action !== 'create') {
        return next();
      }

      if (!context.params.data.blocks || context.params.data.blocks.length === 0) {
        context.params.data.blocks = [{ __component: 'shared.rich-text', body: '' }];
      }

      return next();
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap,
};
