import { getTrad } from '../../../utils';

const layout = [
  {
    intlLabel: {
      id: getTrad('Settings.enabled.label'),
      defaultMessage: 'Settings.enabled.label',
    },
    description: {
      id: getTrad('Settings.enabled.description'),
      defaultMessage: 'Settings.enabled.description',
    },
    name: 'enabled',
    type: 'bool',
    size: {
      col: 6,
      xs: 6,
    },
  },
  {
    intlLabel: {
      id: getTrad('Settings.createUser.label'),
      defaultMessage: 'Settings.createUser.label',
    },
    description: {
      id: getTrad('Settings.createUser.description'),
      defaultMessage: 'Settings.createUser.description',
    },
    name: 'createUserIfNotExists',
    type: 'bool',
    size: {
      col: 6,
      xs: 6,
    },
  },
  {
    intlLabel: {
      id: getTrad('Settings.userConfirmed.label'),
      defaultMessage: 'Settings.userConfirmed.label',
    },
    description: {
      id: getTrad('Settings.userConfirmed.description'),
      defaultMessage: 'Settings.userConfirmed.description',
    },
    name: 'userConfirmed',
    type: 'bool',
    size: {
      col: 6,
      xs: 6,
    },
  },
  {
    intlLabel: {
      id: getTrad('Settings.expirePeriod.label'),
      defaultMessage: 'Settings.expirePeriod.label',
    },
    description: {
      id: getTrad('Settings.expirePeriod.description'),
      defaultMessage: "Settings.expirePeriod.description",
    },
    name: 'expirePeriod',
    type: 'number',
    size: {
      col: 6,
      xs: 6,
    },
  },
  {
    intlLabel: {
      id: getTrad('Settings.message.label'),
      defaultMessage: 'Settings.message.label',
    },
    description: {
      id: getTrad('Settings.message.description'),
      defaultMessage: "Settings.message.description",
    },
    name: 'message',
    type: 'textarea',
    size: {
      col: 6,
      xs: 6,
    },
  },
];

export default layout;