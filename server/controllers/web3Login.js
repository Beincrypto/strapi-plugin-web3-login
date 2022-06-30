'use strict';

/**
 * web3Login.js controller
 *
 * @description: A set of functions called "actions" of the `web3-login` plugin.
 */

const _ = require("lodash");
module.exports = {

  async getSettings(ctx) {
    ctx.send({
      settings: await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'web3-login',
          key: 'settings',
        })
        .get(),
    });
  },

  async updateSettings(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
    }

    await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'web3-login',
        key: 'settings',
      })
      .set({ value: ctx.request.body });

    ctx.send({ ok: true });
  },
};
