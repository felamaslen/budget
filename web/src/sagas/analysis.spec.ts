import axios, { AxiosError } from 'axios';
import { testSaga } from 'redux-saga-test-plan';

import analysisSaga, { onRequest, onBlockRequest } from './analysis';
import {
  ActionTypeAnalysis,
  received,
  blockRequested,
  blockReceived,
} from '~client/actions/analysis';
import { errorOpened } from '~client/actions/error';
import { API_PREFIX } from '~client/constants/data';
import {
  getApiKey,
  getLoadingDeep,
  getAnalysisPeriod,
  getGrouping,
  getPage,
} from '~client/selectors';
import { AnalysisResponse, AnalysisDeepResponse } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-id',
}));

describe('Analysis saga', () => {
  describe('onRequest', () => {
    it('should reuest analysis page data', () => {
      expect.assertions(0);
      const res: { data: AnalysisResponse } = {
        data: {
          data: {
            cost: [],
            saved: 103,
            description: 'some description',
            timeline: null,
          },
        },
      };

      testSaga(onRequest)
        .next()
        .select(getAnalysisPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/month/shop/3`, {
          headers: { Authorization: 'some api key' },
        })
        .next(res)
        .put(received(res.data))
        .next()
        .isDone();
    });

    it('should handle errors', () => {
      expect.assertions(0);

      const err = new Error('something bad happened') as AxiosError;

      testSaga(onRequest)
        .next()
        .select(getAnalysisPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/month/shop/3`, {
          headers: { Authorization: 'some api key' },
        })
        .throw(err)
        .put(errorOpened('Error loading analysis data: something bad happened'))
        .next()
        .put(received(undefined, err))
        .next()
        .isDone();
    });
  });

  describe('onBlockRequest', () => {
    it('should request analysis deep block data', () => {
      expect.assertions(0);
      const res: { data: AnalysisDeepResponse } = {
        data: { data: { items: [] } },
      };

      testSaga(onBlockRequest, blockRequested('food'))
        .next()
        .select(getLoadingDeep)
        .next(true)
        .select(getAnalysisPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/deep/food/month/shop/3`, {
          headers: { Authorization: 'some api key' },
        })
        .next(res)
        .put(blockReceived(res.data))
        .next()
        .isDone();
    });

    it('should not do anything if loadingDeep was not set', () => {
      expect.assertions(0);
      testSaga(onBlockRequest, blockRequested('Fish'))
        .next()
        .select(getLoadingDeep)
        .next(false)
        .isDone();
    });

    it('should handle errors', () => {
      expect.assertions(0);

      const err = new Error('something bad happened') as AxiosError;

      testSaga(onBlockRequest, blockRequested('food'))
        .next()
        .select(getLoadingDeep)
        .next(true)
        .select(getAnalysisPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/deep/food/month/shop/3`, {
          headers: { Authorization: 'some api key' },
        })
        .throw(err)
        .put(errorOpened('Error loading analysis block data: something bad happened'))
        .next()
        .put(blockReceived(undefined, err))
        .next()
        .isDone();
    });
  });

  it('should fork other sagas', () => {
    expect.assertions(0);
    testSaga(analysisSaga)
      .next()
      .takeLatest(ActionTypeAnalysis.Requested, onRequest)
      .next()
      .takeLatest(ActionTypeAnalysis.BlockRequested, onBlockRequest)
      .next()
      .isDone();
  });
});
