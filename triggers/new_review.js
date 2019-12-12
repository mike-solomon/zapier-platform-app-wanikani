const moment = require('moment');
const sample = require('../samples/review');
const { API_BASE_URL } = require('../constants');

const triggerNewReview = async (z, bundle) => {
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
    let numberOfRadicals = 0;
    let numberOfKanji = 0;
    let numberOfVocabWords = 0;

    parsedJSON.data.forEach(entry => {
      if (entry.data.subject_type === 'radical') {
        numberOfRadicals++;
      } else if (entry.data.subject_type === 'kanji') {
        numberOfKanji++;
      } else if (entry.data.subject_type === 'vocabulary') {
        numberOfVocabWords++;
      }
    });

    const firstReviewId = parsedJSON.data[0].id;
    const lastReviewId = parsedJSON.data.slice(-1)[0].id;

    return [
      {
        id: firstReviewId + '-' + lastReviewId,
        numberOfReviews: parsedJSON.total_count,
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
