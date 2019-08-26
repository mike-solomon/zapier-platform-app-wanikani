// const authentication = require('./authentication');

const App = {
  version: require('./package.json').version, // eslint-disable-line global-require
  platformVersion: require('zapier-platform-core').version, // eslint-disable-line global-require

  // authentication,

  beforeRequest: [],

  afterResponse: [],

  resources: {},

  triggers: {},

  searches: {},

  creates: {},
};

module.exports = App;
