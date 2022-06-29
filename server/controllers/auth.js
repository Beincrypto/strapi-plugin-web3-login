'use strict';
/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

const {sanitize} = require('@strapi/utils');

/* eslint-disable no-useless-escape */
const _ = require('lodash');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  async login(ctx) {
    const {web3Login} = strapi.plugins['web3-login'].services;
    const {user: userService, jwt: jwtService} = strapi.plugins['users-permissions'].services;
    const {wallet, signature} = ctx.query;

    const isEnabled = await web3Login.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    if (_.isEmpty(wallet)) {
      return ctx.badRequest('wallet.invalid');
    }
    if (_.isEmpty(signature)) {
      return ctx.badRequest('signature.invalid');
    }
    const nonce = await web3Login.fetchNonce(wallet);

    if (!nonce || !nonce.active) {
      return ctx.badRequest('nonce.invalid');
    }

    const isExpired = await web3Login.isNonceExpired(nonce);

    if (isExpired) {
      await web3Login.deactivateNonce(nonce);
      return ctx.badRequest('nonce.expired');
    }

    // OK, there is a valid nonce for the wallet

    // deactivate nonce
    await web3Login.deactivateNonce(nonce);

    // TODO: check signature

    let user;
    try {
      user = await web3Login.user(wallet);
    } catch (e) {
      return ctx.badRequest('invalid.user')
    }

    if (!user) {
      return ctx.badRequest('wrong.user');
    }

    if (user.blocked) {
      return ctx.badRequest('blocked.user');
    }

    if (!user.confirmed) {
      await userService.edit(user.id, {confirmed: true});
    }
    const userSchema = strapi.getModel('plugin::users-permissions.user');
    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

    let context = {};
    /*
    TODO: add save context un nonce creation, if it makes sense
    try {
      context = JSON.parse(nonce.context);
    } catch (e) {
      context = {}
    }
    */
    ctx.send({
      jwt: jwtService.issue({id: user.id}),
      user: sanitizedUserInfo,
      context
    });
  },

  async sendNonce(ctx) {
    const {web3Login} = strapi.plugins['web3-login'].services;
    const {wallet} = ctx.query;

    const isEnabled = await web3Login.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    const isAddress = true; // TODO ethers

    if (!wallet || !isAddress) {
      return ctx.badRequest('wrong.wallet');
    }

    try {
      const nonce = await web3Login.createNonce(wallet);
      ctx.send({
        nonce,
      });
    } catch (err) {
      return ctx.badRequest(err);
    }
  },
};