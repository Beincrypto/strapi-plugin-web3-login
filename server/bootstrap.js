'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */
const web3LoginActions = {
  actions: [
    {
      // Settings
      section: 'plugins',
      displayName: 'Read',
      uid: 'settings.read',
      subCategory: 'Settings',
      pluginName: 'web3-login',
    },
    {
      // Settings Update
      section: 'plugins',
      displayName: 'Edit',
      uid: 'settings.update',
      subCategory: 'Settings',
      pluginName: 'web3-login',
    },
  ],
};

module.exports = async (
  {
    strapi
  }
) => {
  const pluginStore = strapi.store({
    environment: '',
    type: 'plugin',
    name: 'web3-login',
  });
  const settings = await pluginStore.get({key: 'settings'});

  if (!settings) {
    const value = {
      enabled: true,
      createUserIfNotExists: true,
      userConfirmed: true,
      expirePeriod: 30,
      message: `Welcome to this fancy App!

Please, sign this message to login, it will not cost any gas, we are not sending a blockchain transaction.
      
Wallet address:
_{wallet}
      
Nonce:
_{nonce}`,
    };

    await pluginStore.set({key: 'settings', value});
  }

  await strapi.admin.services.permission.actionProvider.registerMany(
    web3LoginActions.actions
  );
  
  await strapi.plugin('web3-login').service('web3Login').initialize();
};
