/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';

import '~client-test/browser';
import { delay, take } from 'redux-saga/effects';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import fundsSaga, {
    getFundHistoryQuery,
    requestFundPeriodData,
    requestStocksList,
    watchQuotesReceived,
    requestQuotes,
    requestQuotesLoop
} from '~client/sagas/funds';
import { errorOpened } from '~client/actions/error';
import { fundsRequested, fundsReceived } from '~client/actions/funds';
import { stocksListReceived } from '~client/actions/stocks';
import { getApiKey } from '~client/selectors/api';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getPeriod } from '~client/selectors/funds';
import { getStocks, getIndices } from '~client/selectors/stocks';
import { API_PREFIX } from '~client/constants/data';
import { FUNDS_REQUESTED } from '~client/constants/actions/funds';
import { STOCKS_LIST_REQUESTED, STOCKS_LIST_RECEIVED } from '~client/constants/actions/stocks';
import { STOCK_PRICES_DELAY } from '~client/constants/stocks';

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

test('requestQuotes sends an action to the socket', t => {
    const io = {
        emit: () => null
    };

    testSaga(requestQuotes, io)
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
        .call([io, 'emit'], 'request-quotes', ['code1', 'code2', 'code3', 'indice1', 'indice2'])
        .next()
        .isDone();

    t.pass();
});

test('requestQuotes doesn\'t do anything if there are no quotes to request', t => {
    const io = {
        emit: () => null
    };

    testSaga(requestQuotes, io)
        .next()
        .select(getStocks)
        .next([])
        .select(getIndices)
        .next([])
        .isDone();

    t.pass();
});

test('requestQuotesLoop requests quotes on a loop', t => {
    const io = {
        emit: () => null
    };

    testSaga(requestQuotesLoop, io)
        .next()
        .call(requestQuotes, io)
        .next()
        .race([
            delay(STOCK_PRICES_DELAY),
            take(STOCKS_LIST_RECEIVED)
        ])
        .next()
        .call(requestQuotes, io)
        .next(); // etc.

    t.pass();
});

test('fundsSaga forks other sagas', t => {
    const io = { isIoServer: true };

    testSaga(fundsSaga, io)
        .next()
        .takeLatest(FUNDS_REQUESTED, requestFundPeriodData)
        .next()
        .takeLatest(STOCKS_LIST_REQUESTED, requestStocksList)
        .next()
        .fork(watchQuotesReceived, io)
        .next()
        .fork(requestQuotesLoop, io)
        .next()
        .isDone();

    t.pass();
});
