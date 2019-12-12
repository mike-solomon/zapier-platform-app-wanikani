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

// This is a way to help free users filter this trigger without having
// to set up an actual filter. It will ensure that users are only
// notified if their number of * is above the respective values.
const checkIfWeShouldNotifyUser = (
  z,
  bundle,
  numberOfReviews,
  numberOfRadicals,
  numberOfKanji,
  numberOfVocabWords
) => {
  let shouldNotifyUser = true;

  if (
    bundle.inputData.minReviews &&
    numberOfReviews < bundle.inputData.minReviews
  ) {
    shouldNotifyUser = false;
  }

  if (
    bundle.inputData.minRadicals &&
    numberOfRadicals < bundle.inputData.minRadicals
  ) {
    shouldNotifyUser = false;
  }

  if (bundle.inputData.minKanji && numberOfKanji < bundle.inputData.minKanji) {
    shouldNotifyUser = false;
  }

  if (
    bundle.inputData.minVocab &&
    numberOfVocabWords < bundle.inputData.minVocab
  ) {
    shouldNotifyUser = false;
  }

  return shouldNotifyUser;
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

    const numberOfReviews = allReviews.total_count;
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

    if (
      !checkIfWeShouldNotifyUser(
        z,
        bundle,
        numberOfReviews,
        numberOfRadicals,
        numberOfKanji,
        numberOfVocabWords
      )
    ) {
      return [];
    }

    return [
      {
        // By setting the available at time of the most recent reviews to the id,
        // we can ensure that we won't trigger multiple times on the same reviews
        // even when people are doing their reviews.
        id: moment.utc(availableAtTime).format(),
        numberOfReviews: numberOfReviews,
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

    inputFields: [
      {
        key: 'info',
        type: 'copy',
        helpText:
          'Providing any of the below fields will ensure that you only get notified ' +
          'if the number of reviews/radicals/etc is above the number specified. If ' +
          'you provide none, you will be notified whenever new reviews become available.',
      },
      {
        key: 'minReviews',
        label: 'Minimum Number Of Reviews',
        type: 'integer',
      },
      {
        key: 'minRadicals',
        label: 'Minimum Number Of Radicals',
        type: 'integer',
      },
      {
        key: 'minKanji',
        label: 'Minimum Number Of Kanji',
        type: 'integer',
      },
      {
        key: 'minVocab',
        label: 'Minimum Number Of Vocab Words',
        type: 'integer',
      },
    ],

    sample,
  },
};
