module.exports = [
  {
    method: 'GET',
    path: '/settings',
    handler: 'web3Login.getSettings',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::web3-login.settings.read'],
          },
        },
      ],
    }
  },
  {
    method: 'PUT',
    path: '/settings',
    handler: 'web3Login.updateSettings',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::web3-login.settings.update'],
          },
        },
      ],
    }
  },
]