/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';

import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import fundsSaga, {
    requestFundPeriodData,
    requestStocksList,
    requestStocksPrices
} from '~client/sagas/funds';
import { errorOpened } from '~client/actions/error';
import { fundsPeriodChanged, fundsPeriodLoaded } from '~client/actions/funds';
import { stocksListReceived, stockPricesReceived } from '~client/actions/stocks';
import { getApiKey } from '~client/selectors/api';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getStocks, getIndices } from '~client/selectors/funds/stocks';
import { getStockPricesFromYahoo } from '~client/modules/finance';
import { API_PREFIX } from '~client/constants/data';
import { FUNDS_PERIOD_CHANGED } from '~client/constants/actions/funds';
import { STOCKS_LIST_REQUESTED, STOCKS_PRICES_REQUESTED } from '~client/constants/actions/stocks';

test('requestFundPeriodData returns cached data', t => {
    t.is(1, 1);

    testSaga(requestFundPeriodData, fundsPeriodChanged('month5'))
        .next()
        .select(getFundsCache)
        .next({ month5: 'some data' })
        .put(fundsPeriodLoaded('month5'))
        .next()
        .isDone();
});

test('requestFundPeriodData requests new data', t => {
    t.is(1, 1);

    const res = {
        data: { is: 'funds data' }
    };

    testSaga(requestFundPeriodData, fundsPeriodChanged('month5'))
        .next()
        .select(getFundsCache)
        .next({})
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=month&length=5&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .next(res)
        .put(fundsPeriodLoaded('month5', res))
        .next()
        .isDone();

    testSaga(requestFundPeriodData, fundsPeriodChanged('month5', false))
        .next()
        .select(getFundsCache)
        .next({
            month5: 'stale data'
        })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, '/api/v4/data/funds?period=month&length=5&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .next(res)
        .put(fundsPeriodLoaded('month5', res))
        .next()
        .isDone();
});

test('requestFundPeriodData handles errors', t => {
    t.is(1, 1);

    const stub = sinon.stub(shortid, 'generate').returns('some-id');

    const err = new Error('something bad happened');

    testSaga(requestFundPeriodData, fundsPeriodChanged('year3'))
        .next()
        .select(getFundsCache)
        .next({})
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

    const res = { isRes: true };

    testSaga(requestStocksList)
        .next()
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/stocks`, { headers: { Authorization: 'some api key' } })
        .next(res)
        .put(stocksListReceived(res))
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
        .call(getStockPricesFromYahoo, ['code1', 'code2', 'code3', 'indice1', 'indice2'])
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
        .call(getStockPricesFromYahoo, ['code1', 'code2', 'code3', 'indice1', 'indice2'])
        .throw(err)
        .put(stockPricesReceived(null, err))
        .next()
        .isDone();
});

test('fundsSaga forks other sagas', t => {
    t.is(1, 1);
    testSaga(fundsSaga)
        .next()
        .takeLatest(FUNDS_PERIOD_CHANGED, requestFundPeriodData)
        .next()
        .takeLatest(STOCKS_LIST_REQUESTED, requestStocksList)
        .next()
        .takeLatest(STOCKS_PRICES_REQUESTED, requestStocksPrices)
        .next()
        .isDone();
});
