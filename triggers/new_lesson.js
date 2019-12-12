const moment = require('moment');
const sample = require('../samples/lesson');
const { API_BASE_URL } = require('../constants');

// If there are new lessons, return the time they become unlocked.
const checkForNewLessons = async (z, bundle) => {
  // Filter the lessons to only the ones that came into existence
  // within the past 30 minutes. This helps ensure we don't notify
  // people many times about old lessons.
  const now = moment.utc();
  const thirtyMinutesAgo = now.subtract(30, 'minutes').toISOString();

  const checkForNewLessonsResponse = await z.request({
    url: `${API_BASE_URL}/assignments`,
    params: {
      immediately_available_for_lessons: true,
      updated_after: thirtyMinutesAgo,
    },
    prefixErrorMessageWith: 'Unable to retrieve lessons',
  });

  const parsedJSON = z.JSON.parse(checkForNewLessonsResponse.content);

  if (parsedJSON && parsedJSON.data && parsedJSON.total_count) {
    // The unlocked at time will always be the same for all lessons
    return parsedJSON.data[0].data.unlocked_at;
  }
};

const getAllLessons = async (z, bundle) => {
  const getAllLessonsResponse = await z.request({
    url: `${API_BASE_URL}/assignments`,
    params: {
      immediately_available_for_lessons: true,
    },
    prefixErrorMessageWith: 'Unable to retrieve lessons',
  });

  const parsedJSON = z.JSON.parse(getAllLessonsResponse.content);

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
  numberOfLessons,
  numberOfRadicals,
  numberOfKanji,
  numberOfVocabWords
) => {
  let shouldNotifyUser = true;

  if (
    bundle.inputData.minLessons &&
    numberOfLessons < bundle.inputData.minLessons
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

const triggerNewLessons = async (z, bundle) => {
  // Users might not always have lessons - so let's just default
  // to returning the sample if the user tries to load samples.
  if (bundle && bundle.meta && bundle.meta.isLoadingSample) {
    return [sample];
  }

  const unlockedAtTime = await checkForNewLessons(z, bundle);

  if (unlockedAtTime) {
    // API Docs for what's returned from getting the list of lessons:
    // https://docs.api.wanikani.com/20170710/#get-all-assignments
    const allLessons = await getAllLessons(z, bundle);

    const numberOfLessons = allLessons.total_count;
    let numberOfRadicals = 0;
    let numberOfKanji = 0;
    let numberOfVocabWords = 0;

    allLessons.data.forEach(lesson => {
      if (lesson.data.subject_type === 'radical') {
        numberOfRadicals++;
      } else if (lesson.data.subject_type === 'kanji') {
        numberOfKanji++;
      } else if (lesson.data.subject_type === 'vocabulary') {
        numberOfVocabWords++;
      }
    });

    if (
      !checkIfWeShouldNotifyUser(
        z,
        bundle,
        numberOfLessons,
        numberOfRadicals,
        numberOfKanji,
        numberOfVocabWords
      )
    ) {
      return [];
    }

    return [
      {
        // By setting the unlocked at time of the most recent lessons to the id,
        // we can ensure that we won't trigger multiple times on the same lessons
        // even when people are doing their lessons.
        id: moment.utc(unlockedAtTime).format(),
        numberOfLessons: numberOfLessons,
        numberOfRadicals: numberOfRadicals,
        numberOfKanji: numberOfKanji,
        numberOfVocabWords: numberOfVocabWords,
      },
    ];
  }

  return [];
};

module.exports = {
  key: 'new_lesson',
  noun: 'Lesson',

  display: {
    label: 'New Lesson',
    description: 'Triggers when new lessons become available.',
    important: true,
  },

  operation: {
    perform: triggerNewLessons,

    inputFields: [
      {
        key: 'info',
        type: 'copy',
        helpText:
          'Providing any of the below fields will ensure that you only get notified ' +
          'if the number of lessons/radicals/etc is above the number specified. If ' +
          'you provide none, you will be notified whenever new lessons become available.',
      },
      {
        key: 'minLessons',
        label: 'Minimum Number Of Lessons',
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
