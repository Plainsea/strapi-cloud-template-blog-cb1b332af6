module.exports = {
    'strapi-cache': {
        enabled: true,
        config: {
            debug: false,
            max: 1000,
            ttl: 1000 * 60 * 60,
            size: 1024 * 1024 * 1024,
            allowStale: false,
            cacheableRoutes: ['/api/tags', '/api/articles', '/api/categories'], // Routes to cache
            excludeRoutes: [],
            provider: 'memory',
            cacheHeaders: true,
            cacheHeadersDenyList: ['access-control-allow-origin', 'content-encoding'],
            cacheAuthorizedRequests: false,
        },
    },
};
