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
    const settings = await web3Login.settings();

    console.log('--- Login')
    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    if (_.isEmpty(wallet)) {
      return ctx.badRequest('wallet.invalid');
    }
    const isAddress = ethers.utils.isAddress(wallet);
    const checksummedAddress = ethers.utils.getAddress(wallet);
    if (!isAddress || wallet !== checksummedAddress) {
      return ctx.badRequest('wrong.wallet');
    }

    console.log(`Wallet: ${wallet}`)
    if (_.isEmpty(signature)) {
      return ctx.badRequest('signature.invalid');
    }
    const nonce = await web3Login.fetchNonce(wallet);

    console.log(`Nonce: ${nonce.nonce}`)
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
    let message = settings.message.replace('_{wallet}', wallet).replace('_{nonce}', nonce.nonce);
    let signerAddress = '';
    console.log(`Message: ${message}`)
    try {
      signerAddress = ethers.utils.verifyMessage(message, signature)
    } catch (error) {
      // no action, signerAddress will be empty, so, login failed anyway
    }
    
    console.log(`SignerAddress: ${signerAddress}`)
    if (wallet !== signerAddress) {
      return ctx.badRequest('wrong.signature')
    }

    let user;
    try {
      user = await web3Login.user(wallet);
    } catch (e) {
      return ctx.badRequest('invalid.user')
    }

    if (!user) {
      return ctx.badRequest('wrong.user');
    }

    console.log(`User: ${user.id}`)
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

    if (_.isEmpty(wallet)) {
      return ctx.badRequest('wallet.invalid');
    }
    try {
      const isAddress = ethers.utils.isAddress(wallet);
      const checksummedAddress = ethers.utils.getAddress(wallet);
      if (!isAddress || wallet !== checksummedAddress) {
        return ctx.badRequest('wrong.wallet');
      }
    } catch (err) {
      return ctx.badRequest('wrong.wallet');
    }

    try {
      const nonce = await web3Login.createNonce(wallet);
      ctx.send({
        nonce: nonce.nonce,
      });
    } catch (err) {
      return ctx.badRequest(err);
    }
  },
};
