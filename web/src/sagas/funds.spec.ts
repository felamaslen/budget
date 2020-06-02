import axios from 'axios';
import { testSaga } from 'redux-saga-test-plan';
import { debounce } from 'redux-saga/effects';

import fundsSaga, {
  getFundHistoryQuery,
  requestFundPeriodData,
  requestStocksList,
  requestStocksPrices,
} from './funds';
import {
  ActionTypeFunds,
  ActionTypeStocks,
  errorOpened,
  fundsRequested,
  fundsReceived,
  stocksListReceived,
  stockPricesReceived,
} from '~client/actions';
import { API_PREFIX } from '~client/constants/data';
import { Period } from '~client/constants/graph';
import { getStockPrices } from '~client/modules/finance';
import { Cache } from '~client/reducers/funds';
import { getApiKey, getFundsCache, getPeriod, getStocks, getIndices } from '~client/selectors';
import { testResponse, testStocksList, testStockPrices } from '~client/test-data';
import { Page } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Funds saga', () => {
  describe('getFundHistoryQuery', () => {
    it('should get a URL query object to specify fund price history detail', () => {
      expect.assertions(0);

      testSaga(getFundHistoryQuery).next().select(getPeriod).next(Period.year5).returns({
        period: 'year',
        length: 5,
        history: true,
      });
    });
  });

  describe('requestFundPeriodData', () => {
    it('should return cached data', () => {
      expect.assertions(0);
      testSaga(requestFundPeriodData, fundsRequested(true, Period.month3))
        .next()
        .select(getFundsCache)
        .next({ [Period.month3]: {} as Cache })
        .put(fundsReceived(Period.month3))
        .next()
        .isDone();
    });

    it('should request new data', () => {
      expect.assertions(0);

      const res = { data: { data: testResponse[Page.funds] } };

      testSaga(requestFundPeriodData, fundsRequested(true, Period.month3))
        .next()
        .select(getFundsCache)
        .next({})
        .call(getFundHistoryQuery, Period.month3)
        .next({ period: 'month', length: 3, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=month&length=3&history=true', {
          headers: { Authorization: 'some_api_key' },
        })
        .next(res)
        .put(fundsReceived(Period.month3, res.data))
        .next()
        .isDone();

      testSaga(requestFundPeriodData, fundsRequested(false, Period.month1))
        .next()
        .call(getFundHistoryQuery, Period.month1)
        .next({ period: 'month', length: 1, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=month&length=1&history=true', {
          headers: { Authorization: 'some_api_key' },
        })
        .next(res)
        .put(fundsReceived(Period.month1, res.data))
        .next()
        .isDone();
    });

    it('should use the current period by default', () => {
      expect.assertions(0);

      const res = { data: { data: testResponse[Page.funds] } };

      testSaga(requestFundPeriodData, fundsRequested(false))
        .next()
        .select(getPeriod)
        .next(Period.year5)
        .call(getFundHistoryQuery, Period.year5)
        .next({ period: 'year', length: 5, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=year&length=5&history=true', {
          headers: { Authorization: 'some_api_key' },
        })
        .next(res)
        .put(fundsReceived(Period.year5, res.data))
        .next()
        .isDone();

      testSaga(requestFundPeriodData, fundsRequested(true))
        .next()
        .select(getPeriod)
        .next(Period.year1)
        .select(getFundsCache)
        .next({ [Period.year1]: res })
        .put(fundsReceived(Period.year1))
        .next()
        .isDone();
    });

    it('should handle errors', () => {
      expect.assertions(0);

      const err = new Error('something bad happened');

      testSaga(requestFundPeriodData, fundsRequested(true, Period.year1))
        .next()
        .select(getFundsCache)
        .next({})
        .call(getFundHistoryQuery, Period.year1)
        .next({ period: 'year', length: 1, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=year&length=1&history=true', {
          headers: { Authorization: 'some_api_key' },
        })
        .throw(err)
        .put(errorOpened('Error loading fund data'))
        .next()
        .isDone();
    });
  });

  describe('requestStocksList', () => {
    it('should request a stocks list', () => {
      expect.assertions(0);

      const res = { data: testStocksList };

      testSaga(requestStocksList)
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/stocks`, {
          headers: { Authorization: 'some api key' },
        })
        .next(res)
        .put(stocksListReceived(res.data))
        .next()
        .isDone();
    });

    it('should handle errors', () => {
      expect.assertions(0);

      const err = new Error('something bad happened');

      testSaga(requestStocksList)
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/stocks`, {
          headers: { Authorization: 'some api key' },
        })
        .throw(err)
        .put(stocksListReceived(undefined, err))
        .next()
        .isDone();
    });
  });

  describe('requestStocksPrices', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should request stock prices', () => {
      expect.assertions(0);

      const res = testStockPrices;

      testSaga(requestStocksPrices)
        .next()
        .select(getStocks)
        .next([{ code: 'code1' }, { code: 'code2' }, { code: 'code3' }])
        .select(getIndices)
        .next([{ code: 'indice1' }, { code: 'indice2' }])
        .call(getStockPrices, ['code1', 'code2', 'code3', 'indice1', 'indice2'])
        .next(res)
        .put(stockPricesReceived(res))
        .next()
        .isDone();
    });

    it('should handle errors', () => {
      expect.assertions(0);

      const err = new Error('some error');

      testSaga(requestStocksPrices)
        .next()
        .select(getStocks)
        .next([{ code: 'code1' }, { code: 'code2' }, { code: 'code3' }])
        .select(getIndices)
        .next([{ code: 'indice1' }, { code: 'indice2' }])
        .call(getStockPrices, ['code1', 'code2', 'code3', 'indice1', 'indice2'])
        .throw(err)
        .put(stockPricesReceived(undefined, err))
        .next()
        .isDone();
    });
  });

  it('should fork other sagas', () => {
    expect.assertions(0);
    testSaga(fundsSaga)
      .next()
      .takeLatest(ActionTypeFunds.Requested, requestFundPeriodData)
      .next()
      .takeLatest(ActionTypeStocks.Requested, requestStocksList)
      .next()
      .is(debounce(100, ActionTypeStocks.PricesRequested, requestStocksPrices))
      .next()
      .isDone();
  });
});
