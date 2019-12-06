const { expect } = require('chai');
const zapier = require('zapier-platform-core');
const nock = require('nock');
const { API_BASE_URL } = require('../constants');
const App = require('../index');

const appTester = zapier.createAppTester(App);
const authentication = require('../authentication');

describe('authentication', () => {
  it('is of type custom', () => {
    expect(authentication.type).to.eql('custom');
  });

  const getBundle = () => ({
    authData: {
      api_key: 'someValidApiKey',
    },
  });

  describe('test auth', () => {
    describe('given WaniKani returns a 200 for an API call with a valid token', () => {
      const getUserResponse = require('./fixtures/responses/getUserResponse.json');

      let result;

      before(async () => {
        nock(API_BASE_URL)
          .get('/user')
          .reply(200, getUserResponse);

        result = await appTester(App.authentication.test, getBundle());
      });

      it('returns the expected username', () => {
        expect(result.username).to.eql('mikesol');
      });
    });

    describe('given WaniKani returns a 401 for an API call with an invalid access token', () => {
      const invalidAccessTokenError = require('./fixtures/responses/invalidAccessTokenError'); // eslint-disable-line global-require

      before(() => {
        nock(API_BASE_URL)
          .get('/user')
          .reply(401, invalidAccessTokenError);
      });

      it('returns an error that lets the user know their Access Token is invalid', async () => {
        await expect(
          appTester(App.authentication.test, getBundle())
        ).to.be.rejectedWith(
          'Your Access Token is invalid. Please try reconnecting your account.'
        );
      });
    });
  });
});
