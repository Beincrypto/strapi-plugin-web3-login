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
      const role = await strapi
        .query('plugin::users-permissions.role')
        .findOne({type: userSettings.default_role}, []);

      const newUser = {
        email: '',
        username: wallet,
        role: {id: role.id}
      };
      return strapi
        .query('plugin::users-permissions.user')
        .create({data: newUser, populate: ['role']});
    },

    async user(wallet) {
      const settings = await this.settings();
      const user = await this.fetchUser({username: wallet});
      if (user) {
        return user;
      }
      if (settings.createUserIfNotExists) {
        return this.createUser(wallet)
      }
      return false;
    },

    async createNonce(wallet) {
      const settings = await this.settings();
      // TODO: maybe? const {nonceLength = 20} = settings;
      const noncesService = strapi.query('plugin::web3-login.nonce');
      const nonceToken = nanoid();

      let nonce = noncesService.findOne({where: {wallet}});
      if (nonce) {
        const nonceData = {
          nonce: nonceToken,
          issuedDate: new Date(),
          active: true
        };
        noncesService.update({where: {wallet}, data: nonceData});
      } else {
        const nonceData = {
          wallet,
          nonce: nonceToken,
          issuedDate: new Date(),
          active: true
        };
        nonce = noncesService.create({data: nonceData})
      }
      return nonce;
    },

    fetchNonce(wallet) {
      const noncesService = strapi.query('plugin::web3-login.nonce');
      return noncesService.findOne({where: {wallet}});
    },

    async isNonceExpired(nonce) {
      const settings = await this.settings();
      const nonceDate = new Date(nonce.issuedDate).getTime() / 1000;
      const nowDate = new Date().getTime() / 1000;
      return nowDate - nonceDate > settings.expirePeriod;
    },

    async deactivateNonce(nonce) {
      const noncesService = strapi.query('plugin::web3-login.nonce');
      await noncesService.update(
        {where: {id: nonce.id}, data: {active: false}}
      );
    },

    async fetchUser(data) {
      const userSchema = strapi.getModel('plugin::users-permissions.user');
      const user =  await strapi.query('plugin::users-permissions.user').findOne({where: data, populate: ['role']})
      if (!user) {
        return user;
      }
      return await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);
    }

  };
};
