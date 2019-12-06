const _ = require('lodash');

const { WANIKANI_REVISION } = require('./constants');

const includeBearerToken = (request, z, bundle) => {
  const accessToken = _.get(bundle, 'authData.access_token');
  const authorizationHeader = _.get(request, 'headers.Authorization');

  if (accessToken && !authorizationHeader) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

const includeWanikaniRevision = (request, z, bundle) => {
  request.headers['Wanikani-Revision'] = WANIKANI_REVISION;

  return request;
};

const checkForErrors = (response, z) => {
  // In some cases the lower levels of the code can provide better error
  // messages. If they set this flag in the request, then we should fall back
  // to them to handle the errors.
  if (response.request.disableMiddlewareErrorChecking) {
    return response;
  }

  const responseHttpStatusCode = response.status;
  // Don't do any error message checking if we get a response in the 200 status code range
  if (responseHttpStatusCode >= 200 && responseHttpStatusCode < 299) {
    return response;
  }

  // In other cases, we may want to rely on JSON error message parsing from below
  // but also provide a more descriptive prefix.
  let { prefixErrorMessageWith } = response.request;

  if (prefixErrorMessageWith === '') {
    prefixErrorMessageWith = 'WaniKani ran into an error';
  }

  let responseJson;
  try {
    responseJson = z.JSON.parse(response.content);
  } catch (ex) {
    // Ignore it, we'll handle it below
  }

  // TODO: Implement more error handling as I figure out what can go wrong
  const errorMessage = _.get(responseJson, 'error');

  if (errorMessage) {
    throw new Error(`${prefixErrorMessageWith}: ${errorMessage}`);
  }

  // If we end up here guess we don't really have any idea what happened so we'll
  // just return the generic content.
  throw new Error(
    `${prefixErrorMessageWith}. Error code ${responseHttpStatusCode}: ${response.content}`
  );
};

module.exports = {
  includeBearerToken,
  includeWanikaniRevision,
  checkForErrors,
};
