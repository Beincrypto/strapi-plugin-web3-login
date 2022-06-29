const pluginPermissions = {
  main: [
    {action: 'plugin::web3-login.main', subject: null}
  ],
  readSettings: [
    {action: 'plugin::web3-login.settings.read', subject: null},
  ],
  updateSettings: [
    {action: 'plugin::web3-login.settings.update', subject: null},
  ],

};

export default pluginPermissions;