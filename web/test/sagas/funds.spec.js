/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';

import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import { debounce } from 'redux-saga/effects';
import axios from 'axios';

import fundsSaga, {
    getFundHistoryQuery,
    requestFundPeriodData,
    requestStocksList,
    requestStocksPrices
} from '~client/sagas/funds';
import { errorOpened } from '~client/actions/error';
import { fundsRequested, fundsReceived } from '~client/actions/funds';
import { stocksListReceived, stockPricesReceived } from '~client/actions/stocks';
import { getApiKey } from '~client/selectors/api';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getPeriod } from '~client/selectors/funds';
import { getStocks, getIndices } from '~client/selectors/funds/stocks';
import { getStockPrices } from '~client/modules/finance';
import { API_PREFIX } from '~client/constants/data';
import { FUNDS_REQUESTED } from '~client/constants/actions/funds';
import { STOCKS_LIST_REQUESTED, STOCKS_PRICES_REQUESTED } from '~client/constants/actions/stocks';

test('getFundHistoryQuery gets a URL query object to specify fund price history detail', t => {
    t.is(1, 1);

    testSaga(getFundHistoryQuery)
        .next()
        .select(getPeriod)
        .next('year5')
        .returns({
            period: 'year',
            length: '5',
            history: true
        });
});

test('requestFundPeriodData returns cached data', t => {
    t.is(1, 1);

    testSaga(requestFundPeriodData, fundsRequested(true, 'month5'))
        .next()
        .select(getFundsCache)
        .next({ month5: 'some data' })
        .put(fundsReceived('month5'))
        .next()
        .isDone();
});

test('requestFundPeriodData requests new data', t => {
    t.is(1, 1);

    const res = {
        data: { is: 'funds data' }
    };

    testSaga(requestFundPeriodData, fundsRequested(true, 'month5'))
        .next()
        .select(getFundsCache)
        .next({})
        .call(getFundHistoryQuery, 'month5')
        .next({ period: 'month', length: 5, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=month&length=5&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .next(res)
        .put(fundsReceived('month5', res.data))
        .next()
        .isDone();

    testSaga(requestFundPeriodData, fundsRequested(false, 'month5'))
        .next()
        .call(getFundHistoryQuery, 'month5')
        .next({ period: 'month', length: 5, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=month&length=5&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .next(res)
        .put(fundsReceived('month5', res.data))
        .next()
        .isDone();
});

test('requestFundPeriodData uses the current period by default', t => {
    t.is(1, 1);

    const res = {
        data: { is: 'funds data' }
    };

    testSaga(requestFundPeriodData, fundsRequested(false))
        .next()
        .select(getPeriod)
        .next('year5')
        .call(getFundHistoryQuery, 'year5')
        .next({ period: 'year', length: 5, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=year&length=5&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .next(res)
        .put(fundsReceived('year5', res.data))
        .next()
        .isDone();

    testSaga(requestFundPeriodData, fundsRequested(true))
        .next()
        .select(getPeriod)
        .next('year5')
        .select(getFundsCache)
        .next({ year5: 'some data' })
        .put(fundsReceived('year5'))
        .next()
        .isDone();
});

test('requestFundPeriodData handles errors', t => {
    t.is(1, 1);

    const stub = sinon.stub(shortid, 'generate').returns('some-id');

    const err = new Error('something bad happened');

    testSaga(requestFundPeriodData, fundsRequested(true, 'year3'))
        .next()
        .select(getFundsCache)
        .next({})
        .call(getFundHistoryQuery, 'year3')
        .next({ period: 'year', length: 3, history: true })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=year&length=3&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .throw(err)
        .put(errorOpened('Error loading fund data'))
        .next()
        .isDone();

    stub.restore();
});

test('requestStocksList requests stocks list', t => {
    t.is(1, 1);

    const res = { data: { isRes: true } };

    testSaga(requestStocksList)
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/stocks`, { headers: { Authorization: 'some api key' } })
        .next(res)
        .put(stocksListReceived(res.data))
        .next()
        .isDone();
});

test('requestStocksList handles errors', t => {
    t.is(1, 1);

    const err = new Error('something bad happened');

    testSaga(requestStocksList)
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/stocks`, { headers: { Authorization: 'some api key' } })
        .throw(err)
        .put(stocksListReceived(null))
        .next()
        .isDone();
});

test('requestStocksPrices requests stock prices', t => {
    t.is(1, 1);

    const res = { isRes: true };

    testSaga(requestStocksPrices)
        .next()
        .select(getStocks)
        .next([
            { code: 'code1' },
            { code: 'code2' },
            { code: 'code3' }
        ])
        .select(getIndices)
        .next([
            { code: 'indice1' },
            { code: 'indice2' }
        ])
        .call(getStockPrices, ['code1', 'code2', 'code3', 'indice1', 'indice2'])
        .next(res)
        .put(stockPricesReceived(res))
        .next()
        .isDone();
});

test('requestStocksPrices handles errors', t => {
    t.is(1, 1);

    const err = new Error('some error');

    testSaga(requestStocksPrices)
        .next()
        .select(getStocks)
        .next([
            { code: 'code1' },
            { code: 'code2' },
            { code: 'code3' }
        ])
        .select(getIndices)
        .next([
            { code: 'indice1' },
            { code: 'indice2' }
        ])
        .call(getStockPrices, ['code1', 'code2', 'code3', 'indice1', 'indice2'])
        .throw(err)
        .put(stockPricesReceived(null, err))
        .next()
        .isDone();
});

test('fundsSaga forks other sagas', t => {
    t.is(1, 1);
    testSaga(fundsSaga)
        .next()
        .takeLatest(FUNDS_REQUESTED, requestFundPeriodData)
        .next()
        .takeLatest(STOCKS_LIST_REQUESTED, requestStocksList)
        .next()
        .is(debounce(100, STOCKS_PRICES_REQUESTED, requestStocksPrices))
        .next()
        .isDone();
});
