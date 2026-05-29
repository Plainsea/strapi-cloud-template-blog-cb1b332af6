'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tombola/winners',
      handler: 'tombola.getWinners',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/tombola/winners',
      handler: 'tombola.drawWinners',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/tombola/winners',
      handler: 'tombola.resetWinners',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
