'use strict';

// Better defaults for the admin's list views (the tables in the Content Manager).
//
// Strapi's own defaults show 10 rows, start with an `id` column and sort by
// title, which makes finding anything slow. These views are applied only while
// a table still has Strapi's untouched default (see isUntouched), so a view
// someone has already arranged with "Configure the view", here or on Strapi
// Cloud, is never overwritten.
//
// Search (the magnifier above each table) and the Filters button work on top
// of these views; `filterable` and `searchable` are turned on explicitly.

const PAGE_SIZE = 50;

const VIEWS = {
  'api::article.article': {
    columns: ['title', 'category', 'dateAdded', 'author', 'slug'],
    sortBy: 'dateAdded',
    sortOrder: 'DESC',
    labels: { dateAdded: 'Date' },
  },
  'api::glossary-term.glossary-term': {
    columns: ['title', 'abbreviation', 'isPillar', 'slug', 'updatedAt'],
    sortBy: 'title',
    sortOrder: 'ASC',
    labels: { isPillar: 'Key topic', updatedAt: 'Updated' },
  },
  'api::use-case.use-case': {
    columns: ['title', 'order', 'slug', 'updatedAt'],
    sortBy: 'order',
    sortOrder: 'ASC',
    labels: { updatedAt: 'Updated' },
  },
  'api::testimonial.testimonial': {
    columns: ['authorName', 'companyName', 'authorRole', 'rating', 'order'],
    sortBy: 'order',
    sortOrder: 'ASC',
    labels: { authorName: 'Author', companyName: 'Company', authorRole: 'Role' },
  },
  'api::announcement.announcement': {
    columns: ['title', 'buttonTitle', 'link', 'updatedAt'],
    sortBy: 'updatedAt',
    sortOrder: 'DESC',
    labels: { buttonTitle: 'Button', updatedAt: 'Updated' },
  },
  'api::author.author': {
    columns: ['name', 'email', 'avatar'],
    sortBy: 'name',
    sortOrder: 'ASC',
  },
  'api::category.category': {
    columns: ['name', 'slug', 'articles'],
    sortBy: 'name',
    sortOrder: 'ASC',
  },
  'api::tag.tag': {
    columns: ['name', 'updatedAt'],
    sortBy: 'name',
    sortOrder: 'ASC',
    labels: { updatedAt: 'Updated' },
  },
  'api::tombola.tombola': {
    columns: ['Name', 'Email', 'Company', 'IsWinner', 'createdAt'],
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    labels: { IsWinner: 'Winner', createdAt: 'Signed up' },
  },
};

/** Strapi's generated default: an `id` first column and 10 rows a page. */
function isUntouched(configuration) {
  return configuration.layouts?.list?.[0] === 'id' && configuration.settings?.pageSize === 10;
}

async function setAdminListViews(strapi) {
  const service = strapi.plugin('content-manager').service('content-types');

  for (const [uid, view] of Object.entries(VIEWS)) {
    const model = strapi.contentTypes[uid];
    if (!model) continue;

    const configuration = await service.findConfiguration(model);
    if (!isUntouched(configuration)) continue;

    const { metadatas = {} } = configuration;
    // Only columns that exist and the admin can show in a table.
    const columns = view.columns.filter((field) => metadatas[field]?.list);
    if (!columns.length) continue;

    for (const [field, label] of Object.entries(view.labels ?? {})) {
      if (metadatas[field]?.list) metadatas[field].list.label = label;
    }

    const { uid: _uid, ...rest } = configuration;
    await service.updateConfiguration(model, {
      ...rest,
      settings: {
        ...configuration.settings,
        pageSize: PAGE_SIZE,
        searchable: true,
        filterable: true,
        defaultSortBy: metadatas[view.sortBy]?.list?.sortable ? view.sortBy : configuration.settings.defaultSortBy,
        defaultSortOrder: view.sortOrder,
      },
      layouts: { ...configuration.layouts, list: columns },
      metadatas,
    });
    strapi.log.info(`[admin-list-views] Set the list view for ${uid}`);
  }
}

module.exports = setAdminListViews;
