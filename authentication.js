const { API_BASE_URL } = require('./constants');

const testAuth = async z => {
  const response = await z.request({
    method: 'GET',
    url: `${API_BASE_URL}/user`,
    disableMiddlewareErrorChecking: true,
    skipThrowForStatus: true,
  });

  if (response.status !== 200) {
    throw new Error(
      'Your Access Token is invalid. Please try reconnecting your account.'
    );
  }
  return z.JSON.parse(response.content).data;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'access_token',
      label: 'Access Token',
      required: true,
      type: 'string',
      helpText:
        'Create a new Access Token key from your [API Tokens page](https://www.wanikani.com/settings/personal_access_tokens) in WaniKani.',
    },
  ],
  test: testAuth,
  connectionLabel: '{{username}}',
};
