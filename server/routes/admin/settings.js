module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'web3-login.index',
    config: {policies: []}
  },
  {
    method: 'GET',
    path: '/settings',
    handler: 'web3-login.getSettings',
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
    handler: 'web3-login.updateSettings',
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