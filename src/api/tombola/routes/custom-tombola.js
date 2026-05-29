'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tombola/winners',
      handler: 'tombola.winners',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
