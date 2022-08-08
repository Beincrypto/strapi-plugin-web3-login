module.exports = [
  {
    method: 'POST',
    path: '/login',
    handler: 'auth.login',
    config: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/nonce/:wallet',
    handler: 'auth.sendNonce',
    config: {
      auth: false
    }
  }
]