'use strict';

// Lets the site read these types without a token (Settings > Users & Permissions > Public).
//
// On Strapi Cloud this is otherwise a manual click per new type, easy to forget,
// and the site then quietly shows nothing. Only adds missing find/findOne
// permissions; never removes anything an editor set.

const PUBLIC_READ = [
  'api::comparison.comparison',
  'api::trust-page.trust-page',
  'api::case-study.case-study',
  'api::testimonial.testimonial',
];

async function ensurePublicRead(strapi) {
  const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;

  for (const uid of PUBLIC_READ) {
    if (!strapi.contentTypes[uid]) continue;
    // Single types have only find.
    const actions = strapi.contentTypes[uid].kind === 'singleType' ? ['find'] : ['find', 'findOne'];
    for (const action of actions) {
      const name = `${uid}.${action}`;
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: name, role: role.id } });
      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({ data: { action: name, role: role.id } });
      }
    }
  }
}

module.exports = ensurePublicRead;
