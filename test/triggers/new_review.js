const { API_BASE_URL } = require('../../constants');
const { expect } = require('chai');
const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('WaniKani App', () => {
  it('declares a new review trigger', () =>
    expect(App.triggers.new_review).to.exist);

  describe('new review trigger', () => {
    describe('given WaniKani returns a valid list of reviews', () => {
      const getNewReviewsResponse = require('../fixtures/responses/getNewReviewsResponse'); // eslint-disable-line global-require
      const getAllReviewsResponse = require('../fixtures/responses/getAllReviewsResponse'); // eslint-disable-line global-require

      let result;
      let newReviewsCall;
      let allReviewsCall;

      before(async () => {
        newReviewsCall = nock(API_BASE_URL)
          .get('/assignments')
          .query(true)
          .reply(200, getNewReviewsResponse);

        allReviewsCall = nock(API_BASE_URL)
          .get('/assignments')
          .query({ immediately_available_for_review: 'true' })
          .reply(200, getAllReviewsResponse);

        // when the user tries to get a list of reviews
        result = await appTester(App.triggers.new_review.operation.perform);
      });

      it('returns the expected review data', () => {
        expect(result.length).to.eql(1);
        expect(result[0].numberOfReviews).to.eql(32);
        expect(result[0].numberOfRadicals).to.eql(0);
        expect(result[0].numberOfKanji).to.eql(3);
        expect(result[0].numberOfVocabWords).to.eql(29);
      });

      it('calls the expected endpoints', () => {
        expect(newReviewsCall.isDone()).to.eql(true);
        expect(allReviewsCall.isDone()).to.eql(true);
      });
    });

    describe('given WaniKani returns no reviews', () => {
      const noReviewsResponse = require('../fixtures/responses/noReviewsResponse'); // eslint-disable-line global-require

      let result;
      before(async () => {
        nock(API_BASE_URL)
          .get('/assignments')
          .query(true)
          .reply(200, noReviewsResponse);

        // when the user tries to get a list of reviews
        result = await appTester(App.triggers.new_review.operation.perform);
      });

      it('returns an empty list with no reviews', () => {
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
          appTester(App.triggers.new_review.operation.perform)
        ).to.be.rejectedWith('Unable to retrieve reviews: some random error');
      });
    });
  });
});
