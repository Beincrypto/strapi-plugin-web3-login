'use strict';
/**
 * auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

const {sanitize} = require('@strapi/utils');
const {ethers} = require("ethers");

/* eslint-disable no-useless-escape */
const _ = require('lodash');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  async login(ctx) {
    const {web3Login} = strapi.plugins['web3-login'].services;
    const {user: userService, jwt: jwtService} = strapi.plugins['users-permissions'].services;
    const {wallet, signature} = ctx.request.body || {};

    const isEnabled = await web3Login.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    if (_.isEmpty(wallet)) {
      return ctx.badRequest('wallet.invalid');
    }
    const isAddress = ethers.utils.isAddress(wallet);
    if (!isAddress) {
      return ctx.badRequest('wrong.wallet');
    }

    const lcWallet = wallet.toLowerCase();
    if (_.isEmpty(signature)) {
      return ctx.badRequest('signature.invalid');
    }
    const nonce = await web3Login.fetchNonce(lcWallet);

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

    // Compose message
    const message = `Welcome to InvestKratic!

Please, sign this message to login, it will not cost any gas, we are not sending a blockchain transaction.
    
Wallet address:
${wallet}
    
Nonce:
${nonce.nonce}`;

    let signerAddress = '';
    try {
      signerAddress = ethers.utils.verifyMessage(message, signature)
    } catch (error) {
      // no action, signerAddress will be empty, so, login failed anyway
    }
    console.log('signerAddress', signerAddress)
    
    if (lcWallet !== signerAddress.toLowerCase()) {
      return ctx.badRequest('wrong.signature')
    }

    let user;
    try {
      user = await web3Login.user(lcWallet);
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
      user = await userService.edit(user.id, {confirmed: true});
    }
    const userSchema = strapi.getModel('plugin::users-permissions.user');
    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

    let context = {};
    /*
    TODO: add save context on nonce creation, if it makes sense
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
    const {wallet} = ctx.params;

    const isEnabled = await web3Login.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    const isAddress = ethers.utils.isAddress(wallet);

    if (!wallet || !isAddress) {
      return ctx.badRequest('wrong.wallet');
    }

    try {
      const nonce = await web3Login.createNonce(wallet.toLowerCase());
      ctx.send({
        nonce,
      });
    } catch (err) {
      return ctx.badRequest(err);
    }
  },
};
