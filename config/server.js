module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: [
      '9b8c746cd899354628277e6b9779721e05e4c82e9d9d6bc729ed9f4d29638c5a',
      '5b17b77eeca7937a30596dbd31718bfd8565f0ea8b80cb497f6f0c6fb11ccc5c',
    ],
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  }
});
