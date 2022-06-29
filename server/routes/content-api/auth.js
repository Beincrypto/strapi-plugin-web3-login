module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: 'auth.login',
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/nonce',
    handler: 'auth.sendNonce',
    config: {
      auth: false
    }
  }
]