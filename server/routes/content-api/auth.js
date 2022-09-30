module.exports = [
  {
    method: 'GET',
    path: '/nonce/:wallet',
    handler: 'auth.sendNonce',
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: 'auth.login',
    config: {
      auth: false
    }
  }
]