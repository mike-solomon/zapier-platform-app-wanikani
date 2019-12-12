const moment = require('moment');
const sample = require('../samples/review');
const { API_BASE_URL } = require('../constants');

// If there are new reviews, return the time they become available.
const checkForNewReviews = async (z, bundle) => {
  // Filter the reviews to only the ones that came into existence
  // within the past 30 minutes. This helps ensure we don't notify
  // people many times about old reviews.
  const now = moment.utc();
  const thirtyMinutesAgo = now.subtract(30, 'minutes').toISOString();

  const checkForNewReviewsResponse = await z.request({
    url: `${API_BASE_URL}/assignments`,
    params: {
      immediately_available_for_review: true,
      available_after: thirtyMinutesAgo,
    },
    prefixErrorMessageWith: 'Unable to retrieve reviews',
  });

  const parsedJSON = z.JSON.parse(checkForNewReviewsResponse.content);

  if (parsedJSON && parsedJSON.data && parsedJSON.total_count) {
    return parsedJSON.data[0].data.available_at;
  }
};

const getAllReviews = async (z, bundle) => {
  const checkForNewReviewsResponse = await z.request({
    url: `${API_BASE_URL}/assignments`,
    params: {
      immediately_available_for_review: true,
    },
    prefixErrorMessageWith: 'Unable to retrieve reviews',
  });

  const parsedJSON = z.JSON.parse(checkForNewReviewsResponse.content);

  if (parsedJSON && parsedJSON.data && parsedJSON.total_count) {
    return parsedJSON;
  }
};

const triggerNewReview = async (z, bundle) => {
  // Users might not always have reviews - so let's just default
  // to returning the sample if the user tries to load samples.
  if (bundle && bundle.meta && bundle.meta.isLoadingSample) {
    return [sample];
  }

  const availableAtTime = await checkForNewReviews(z, bundle);

  if (availableAtTime) {
    // API Docs for what's returned from getting the list of reviews:
    // https://docs.api.wanikani.com/20170710/#get-all-assignments
    const allReviews = await getAllReviews(z, bundle);

    let numberOfRadicals = 0;
    let numberOfKanji = 0;
    let numberOfVocabWords = 0;

    allReviews.data.forEach(review => {
      if (review.data.subject_type === 'radical') {
        numberOfRadicals++;
      } else if (review.data.subject_type === 'kanji') {
        numberOfKanji++;
      } else if (review.data.subject_type === 'vocabulary') {
        numberOfVocabWords++;
      }
    });

    return [
      {
        // By setting the available at time of the most recent reviews to the id,
        // we can ensure that we won't trigger multiple times on the same reviews
        // even when people are doing their reviews.
        id: moment.utc(availableAtTime).format(),
        numberOfReviews: allReviews.total_count,
        numberOfRadicals: numberOfRadicals,
        numberOfKanji: numberOfKanji,
        numberOfVocabWords: numberOfVocabWords,
      },
    ];
  }

  return [];
};

module.exports = {
  key: 'new_review',
  noun: 'Review',

  display: {
    label: 'New Review',
    description: 'Triggers when new reviews become available.',
    important: true,
  },

  operation: {
    perform: triggerNewReview,

    sample,
  },
};
