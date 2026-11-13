'use strict';

/**
 * Keeps drafts out of the public content API.
 *
 * Strapi 5 returns draft versions to anyone who adds ?status=draft to a request,
 * as long as the role may "find" that content type. That includes the Public role,
 * so unpublished articles and terms could be read before they go live.
 *
 * For content API requests without an Authorization header, this drops the
 * status parameter, so they always get the published version (Strapi's default).
 * Requests with an API token, and the admin panel, are not affected.
 */
module.exports = () => async (ctx, next) => {
  const isContentApi = ctx.path.startsWith('/api/');
  const isPublic = !ctx.request.header.authorization;

  if (isContentApi && isPublic && ctx.request.query.status !== undefined) {
    const { status, ...query } = ctx.request.query;
    // Strapi's query parser turns this object back into the query string.
    ctx.request.query = query;
  }

  await next();
};
