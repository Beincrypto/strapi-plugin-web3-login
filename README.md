# Strapi Web3 Wallet Plugin

A plugin for [Strapi Headless CMS](https://github.com/strapi/strapi) that provides ability to sign-in/sign-up to an application signing a message with your web3 wallet.
This plugin works together with [Strapi User Permissions Plugin](https://github.com/strapi/strapi/tree/master/packages/plugins/users-permissions) and extends its functionality.

![Screenshot](https://github.com/Beincrypto/strapi-plugin-web3-login/raw/master/screenshot.png?raw=true)

## ⏳ Installation

Install Strapi with this **Quickstart** command to create a Strapi project instantly:

- (Use **yarn** to install the Strapi project (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
# with yarn
yarn create strapi-app my-project --quickstart

# with npm/npx
npx create-strapi-app my-project --quickstart
```

- Add the `strapi-plugin-web3-login` plugin

- After successful installation you've to build a fresh package that includes plugin UI. To archive that simply use:

```bash
yarn build && yarn develop

# or

npm run build && npm run develop
```

- or just run Strapi in the development mode with `--watch-admin` option:

```bash
yarn develop --watch-admin

#or

npm run develop --watch-admin
```

The **Web3 Login** plugin should appear in the **Plugins** section of Strapi sidebar after you run app again.

## 🔌 Usage

### REST API

#### Get nonce for signing with message

```bash
GET /api/web3-login/nonce/:wallet
```

Response:

```json
{
    "nonce": "_eUM5f71AIEm2W8HF3l2B"
}
```

#### Login with wallet signature

```bash
POST /api/web3-login/login
{
  "wallet":  "0x0...",
  "signature": "0x0..."
}
```

Response:

```json
{
  "jwt": "eyJ...",
  "user": {
      "id": 1,
      "username": "0x0...",
      "email": "",
      "provider": null,
      "confirmed": true,
      "blocked": false,
      "createdAt": "2022-09-30T19:52:11.050Z",
      "updatedAt": "2022-09-30T19:52:11.054Z",
      "role": {
          "id": 1,
          "name": "Authenticated",
          "description": "Default role given to authenticated user.",
          "type": "authenticated",
          "createdAt": "2022-07-22T15:22:30.155Z",
          "updatedAt": "2022-07-22T15:22:30.155Z"
      }
  },
  "context": {}
}
```

## License

[MIT License](LICENSE) Copyright (c) BeInCrypto.
