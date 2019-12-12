const moment = require('moment');
const sample = require('../samples/review');
const { API_BASE_URL } = require('../constants');

/**
 * Cleans up times to format them in the desired Zapier format.
 *
 * Also removes unnecessary and confusing fields.
 */
const cleanReviewEntries = (entry, totalNumberOfReviews) => {
  const availableAt = moment.utc(entry.data.available_at);
  const subjectType = entry.data.subject_type;
  const srsStage = entry.data.srs_stage;
  const srsStageName = entry.data.srs_stage_name;

  // These pieces would be confusing and / or not helpful to users
  delete entry.object;
  delete entry.url;
  delete entry.data_updated_at;
  delete entry.data;

  entry.subjectType = subjectType;
  entry.srsStage = srsStage;
  entry.srsStageName = srsStageName;
  entry.totalNumberOfReviews = totalNumberOfReviews;
  entry.availableAt = availableAt.format();

  return entry;
};

const triggerNewLevel = async (z, bundle) => {
  // Users might not always have reviews - so let's just default
  // to returning the sample if the user tries to load samples.
  if (bundle && bundle.meta && bundle.meta.isLoadingSample) {
    return [sample];
  }

  const response = await z.request({
    url: `${API_BASE_URL}/assignments`,
    params: {
      immediately_available_for_review: true,
    },
    prefixErrorMessageWith: 'Unable to retrieve reviews',
  });

  // API Docs for what's returned:
  // https://docs.api.wanikani.com/20170710/#get-all-assignments
  const parsedJSON = z.JSON.parse(response.content);

  if (parsedJSON && parsedJSON.data && parsedJSON.total_count) {
    return parsedJSON.data.map(entry =>
      cleanReviewEntries(entry, parsedJSON.total_count)
    );
  }

  return [];
};

module.exports = {
  key: 'new_review',
  noun: 'Review',

  display: {
    label: 'New Review',
    description: 'Triggers when you have a new review available.',
    important: true,
  },

  operation: {
    perform: triggerNewLevel,

    sample,
  },
};
