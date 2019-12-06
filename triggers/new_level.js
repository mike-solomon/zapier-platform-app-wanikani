const moment = require('moment');
const sample = require('../samples/level');
const { API_BASE_URL } = require('../constants');

/**
 * Cleans up times to format them in the desired Zapier format.
 *
 * Also removes unnecessary and confusing fields.
 */
const cleanLevelEntries = entry => {
  const level = entry.data.level;
  const unlockedAt = moment.utc(entry.data.unlocked_at);

  // These pieces would be confusing and / or not helpful to users
  delete entry.object;
  delete entry.data_updated_at;
  delete entry.url;
  delete entry.data;

  entry.level = level;
  entry.unlockedAt = unlockedAt.format();

  return entry;
};

const triggerNewLevel = async (z, bundle) => {
  // I couldn't find any way to sort the levels in descending order
  // so, to ensure that we'll always see the current level on the
  // api call, let's only ask for levels in the past year.
  //
  // This should _hopefully_ make it so we don't get more than
  // the 500 level limit but also capture whatever the user's
  // current level is.
  const now = moment.utc();
  const oneYearAgo = now.subtract(1, 'year').toISOString();

  const response = await z.request({
    url: `${API_BASE_URL}/level_progressions`,
    params: {
      updated_after: oneYearAgo,
    },
    prefixErrorMessageWith: 'Unable to retrieve current user level',
  });

  // API Docs for what's returned:
  // https://docs.api.wanikani.com/20170710/#get-all-level-progressions
  const parsedJSON = z.JSON.parse(response.content);

  if (parsedJSON && parsedJSON.data) {
    return parsedJSON.data.map(cleanLevelEntries);
  }

  return [];
};

module.exports = {
  key: 'new_level',
  noun: 'Level',

  display: {
    label: 'New Level',
    description: 'Triggers when you reach a new level in WaniKani.',
    important: true,
  },

  operation: {
    perform: triggerNewLevel,

    sample,
  },
};
