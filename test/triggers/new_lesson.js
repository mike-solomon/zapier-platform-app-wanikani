const { API_BASE_URL } = require('../../constants');
const { expect } = require('chai');
const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('WaniKani App', () => {
  it('declares a new lesson trigger', () =>
    expect(App.triggers.new_lesson).to.exist);

  describe('new lesson trigger', () => {
    describe('given WaniKani returns a valid list of lessons', () => {
      describe('given the user does not specify any minimum requirements', () => {
        const getNewLessonsResponse = require('../fixtures/responses/getNewLessonsResponse'); // eslint-disable-line global-require
        const getAllLessonsResponse = require('../fixtures/responses/getAllLessonsResponse'); // eslint-disable-line global-require

        let result;
        let newLessonsCall;
        let allLessonsCall;

        before(async () => {
          newLessonsCall = nock(API_BASE_URL)
            .get('/assignments')
            .query(true)
            .reply(200, getNewLessonsResponse);

          allLessonsCall = nock(API_BASE_URL)
            .get('/assignments')
            .query({ immediately_available_for_lessons: 'true' })
            .reply(200, getAllLessonsResponse);

          // when the user tries to get a list of lessons
          result = await appTester(App.triggers.new_lesson.operation.perform);
        });

        it('returns the expected lesson data', () => {
          expect(result.length).to.eql(1);
          expect(result[0].numberOfLessons).to.eql(78);
          expect(result[0].numberOfRadicals).to.eql(0);
          expect(result[0].numberOfKanji).to.eql(5);
          expect(result[0].numberOfVocabWords).to.eql(73);
        });

        it('calls the expected endpoints', () => {
          expect(newLessonsCall.isDone()).to.eql(true);
          expect(allLessonsCall.isDone()).to.eql(true);
        });
      });

      describe('given there are less lessons than the user requested to be notified for', () => {
        const getNewLessonsResponse = require('../fixtures/responses/getNewLessonsResponse'); // eslint-disable-line global-require
        const getAllLessonsResponse = require('../fixtures/responses/getAllLessonsResponse'); // eslint-disable-line global-require

        let result;

        before(async () => {
          nock(API_BASE_URL)
            .get('/assignments')
            .query(true)
            .reply(200, getNewLessonsResponse);

          nock(API_BASE_URL)
            .get('/assignments')
            .query({ immediately_available_for_lessons: 'true' })
            .reply(200, getAllLessonsResponse);

          const bundle = {
            inputData: {
              minLessons: 100,
            },
          };

          // when the user tries to get a list of lessons
          result = await appTester(
            App.triggers.new_lesson.operation.perform,
            bundle
          );
        });

        it('does not return any results', () => {
          expect(result.length).to.eql(0);
        });
      });

      describe('given there are less radicals than the user requested to be notified for', () => {
        const getNewLessonsResponse = require('../fixtures/responses/getNewLessonsResponse'); // eslint-disable-line global-require
        const getAllLessonsResponse = require('../fixtures/responses/getAllLessonsResponse'); // eslint-disable-line global-require

        let result;

        before(async () => {
          nock(API_BASE_URL)
            .get('/assignments')
            .query(true)
            .reply(200, getNewLessonsResponse);

          nock(API_BASE_URL)
            .get('/assignments')
            .query({ immediately_available_for_lessons: 'true' })
            .reply(200, getAllLessonsResponse);

          const bundle = {
            inputData: {
              minRadicals: 50,
            },
          };

          // when the user tries to get a list of lessons
          result = await appTester(
            App.triggers.new_lesson.operation.perform,
            bundle
          );
        });

        it('does not return any results', () => {
          expect(result.length).to.eql(0);
        });
      });

      describe('given there are less kanji than the user requested to be notified for', () => {
        const getNewLessonsResponse = require('../fixtures/responses/getNewLessonsResponse'); // eslint-disable-line global-require
        const getAllLessonsResponse = require('../fixtures/responses/getAllLessonsResponse'); // eslint-disable-line global-require

        let result;

        before(async () => {
          nock(API_BASE_URL)
            .get('/assignments')
            .query(true)
            .reply(200, getNewLessonsResponse);

          nock(API_BASE_URL)
            .get('/assignments')
            .query({ immediately_available_for_lessons: 'true' })
            .reply(200, getAllLessonsResponse);

          const bundle = {
            inputData: {
              minKanji: 50,
            },
          };

          // when the user tries to get a list of lessons
          result = await appTester(
            App.triggers.new_lesson.operation.perform,
            bundle
          );
        });

        it('does not return any results', () => {
          expect(result.length).to.eql(0);
        });
      });
    });

    describe('given there are less vocab words than the user requested to be notified for', () => {
      const getNewLessonsResponse = require('../fixtures/responses/getNewLessonsResponse'); // eslint-disable-line global-require
      const getAllLessonsResponse = require('../fixtures/responses/getAllLessonsResponse'); // eslint-disable-line global-require

      let result;

      before(async () => {
        nock(API_BASE_URL)
          .get('/assignments')
          .query(true)
          .reply(200, getNewLessonsResponse);

        nock(API_BASE_URL)
          .get('/assignments')
          .query({ immediately_available_for_lessons: 'true' })
          .reply(200, getAllLessonsResponse);

        const bundle = {
          inputData: {
            minVocab: 100,
          },
        };

        // when the user tries to get a list of reviews
        result = await appTester(
          App.triggers.new_lesson.operation.perform,
          bundle
        );
      });

      it('does not return any results', () => {
        expect(result.length).to.eql(0);
      });
    });

    describe('given WaniKani returns no lessons', () => {
      const noLessonsResponse = require('../fixtures/responses/noLessonsResponse'); // eslint-disable-line global-require

      let result;
      before(async () => {
        nock(API_BASE_URL)
          .get('/assignments')
          .query(true)
          .reply(200, noLessonsResponse);

        // when the user tries to get a list of reviews
        result = await appTester(App.triggers.new_lesson.operation.perform);
      });

      it('returns an empty list with no lessnos', () => {
        expect(result.length).to.eql(0);
      });
    });

    describe('given WaniKani returns an invalid response', () => {
      before(() => {
        nock(API_BASE_URL)
          .get('/assignments')
          .query(true)
          .reply(500, { error: 'some random error', code: 500 });
      });

      it('returns a descriptive message', async () => {
        await expect(
          appTester(App.triggers.new_lesson.operation.perform)
        ).to.be.rejectedWith('Unable to retrieve lessons: some random error');
      });
    });
  });
});
