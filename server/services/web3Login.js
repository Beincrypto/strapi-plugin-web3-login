'use strict';

/**
 * web3Login.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require("lodash");
const crypto = require("crypto");
const {sanitize} = require('@strapi/utils');
const {nanoid} = require("nanoid");

module.exports = (
  {
    strapi
  }
) => {
  return {

    async initialize() {
      console.log('Strapi plugin Web3 Login initialized!');
    },

    settings() {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'web3-login',
      });
      return pluginStore.get({key: 'settings'});
    },

    userSettings() {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
      });
      return pluginStore.get({key: 'advanced'});
    },

    async isEnabled() {
      const settings = await this.settings();
      return !!settings.enabled;
    },

    async createUser(wallet) {
      const userSettings = await this.userSettings();
      const role = (await strapi.entityService.findMany('plugin::users-permissions.role', {
        filters: {
          type: userSettings.default_role
        }
      }))[0];

      const newUser = {
        email: '',
        username: wallet,
        role: {id: role.id}
      };

      return strapi
        .query('plugin::users-permissions.user')
        .create({data: newUser, populate: ['role']});
    },

    async fetchUser(data) {
      let user;
      const found = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: data,
        populate: ['role']
      });
      if (found.length === 1) {
        const userSchema = strapi.getModel('plugin::users-permissions.user');
        user = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, found[0]);
      }
      return user;
    },

    async user(wallet) {
      const user = await this.fetchUser({username: wallet});
      if (user) {
        return user;
      }
      const settings = await this.settings();
      if (settings.createUserIfNotExists) {
        return this.createUser(wallet);
      }
      return false;
    },

    async createNonce(wallet) {
      const settings = await this.settings();
      // TODO: maybe? const {nonceLength = 20} = settings;
      const nonceToken = nanoid();

      let nonce;
      const found = await strapi.entityService.findMany('plugin::web3-login.nonce', {filters: {wallet}});
      if (found.length === 1) {
        const nonceData = {
          nonce: nonceToken,
          issuedDate: new Date(),
          active: true
        };
        nonce = await strapi.entityService.update('plugin::web3-login.nonce', found[0].id, {data: nonceData});
      } else {
        const nonceData = {
          wallet,
          nonce: nonceToken,
          issuedDate: new Date(),
          active: true
        };
        nonce = await strapi.entityService.create('plugin::web3-login.nonce', {data: nonceData})
      }
      return nonce;
    },

    async fetchNonce(wallet) {
      let nonce;
      const found = await strapi.entityService.findMany('plugin::web3-login.nonce', {filters: {wallet}});
      if (found.length === 1) {
        nonce = found[0];
      }
      return nonce;
    },

    async isNonceExpired(nonce) {
      const settings = await this.settings();
      const nonceDate = new Date(nonce.issuedDate).getTime() / 1000;
      const nowDate = new Date().getTime() / 1000;
      return nowDate - nonceDate > settings.expirePeriod;
    },

    async deactivateNonce(nonce) {
      await strapi.entityService.update('plugin::web3-login.nonce', nonce.id, {data: {active: false}});
    },

  };
};
