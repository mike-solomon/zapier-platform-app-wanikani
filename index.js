const authentication = require('./authentication');
const middleware = require('./middleware');

const App = {
  version: require('./package.json').version, // eslint-disable-line global-require
  platformVersion: require('zapier-platform-core').version, // eslint-disable-line global-require

  authentication,

  beforeRequest: [
    middleware.includeBearerToken,
    middleware.includeWanikaniRevision,
  ],

  afterResponse: [middleware.checkForErrors],

  resources: {},

  triggers: {},

  searches: {},

  creates: {},
};

module.exports = App;
