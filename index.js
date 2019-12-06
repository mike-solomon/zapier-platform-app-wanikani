const authentication = require('./authentication');
const middleware = require('./middleware');

const NewLevelTrigger = require('./triggers/new_level');

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

  triggers: { [NewLevelTrigger.key]: NewLevelTrigger },

  searches: {},

  creates: {},
};

module.exports = App;
