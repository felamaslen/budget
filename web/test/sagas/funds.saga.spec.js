/* eslint-disable prefer-reflect */
import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import * as S from '~client/sagas/funds.saga';
import * as A from '~client/actions/graph.actions';
import * as B from '~client/actions/stocks-list.actions';
import { openTimedMessage } from '~client/sagas/error.saga';
import { getApiKey } from '~client/selectors/app';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getStocksListInfo } from '~client/selectors/funds/stocks';
import { getStockPricesFromYahoo } from '~client/modules/finance';

let envBefore = null;
test.before(() => {
    envBefore = process.env.DEFAULT_FUND_PERIOD;

    process.env.DEFAULT_FUND_PERIOD = 'year1';
});

test.after(() => {
    process.env.DEFAULT_FUND_PERIOD = envBefore;
});

test('requestFundPeriodData doing nothing if loading from the cache', t => {
    t.is(1, 1);
    testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
        .next()
        .select(getFundsCache)
        .next(fromJS({ foo: 'bar' }))
        .isDone();
});

test('requestFundPeriodData requesting new data', t => {
    t.is(1, 1);
    testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
        .next()
        .select(getFundsCache)
        .next(fromJS({}))
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, 'api/v4/data/funds?period=year&length=1&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .next({ data: { data: 'yes' } })
        .put(A.aFundsGraphPeriodReceived({
            shortPeriod: 'foo', res: 'yes'
        }))
        .next()
        .isDone();
});

test('requestFundPeriodData handleing errors', t => {
    t.is(1, 1);
    testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
        .next()
        .select(getFundsCache)
        .next(fromJS({}))
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, 'api/v4/data/funds?period=year&length=1&history=true', {
            headers: { Authorization: 'some_api_key' }
        })
        .throw(new Error('some error'))
        .call(openTimedMessage, 'Error loading fund data')
        .next()
        .isDone();
});

test('requestStocksPrices requesting stock prices', t => {
    t.is(1, 1);
    testSaga(S.requestStocksPrices)
        .next()
        .select(getStocksListInfo)
        .next({
            stocks: fromJS({ code1: 'code1', code2: 'code2', code3: 'code3' }),
            indices: fromJS([{ code: 'indice1' }, { code: 'indice2' }])
        })
        .call(getStockPricesFromYahoo, fromJS(['code1', 'code2', 'code3', 'indice1', 'indice2']))
        .next({ foo: 'bar' })
        .put(B.aStocksPricesReceived({ foo: 'bar' }))
        .next()
        .isDone();
});

test('requestStocksPrices handleing errors', t => {
    t.is(1, 1);
    testSaga(S.requestStocksPrices)
        .next()
        .select(getStocksListInfo)
        .next({
            stocks: fromJS({ code1: 'code1', code2: 'code2', code3: 'code3' }),
            indices: fromJS([{ code: 'indice1' }, { code: 'indice2' }])
        })
        .call(getStockPricesFromYahoo, fromJS(['code1', 'code2', 'code3', 'indice1', 'indice2']))
        .throw(new Error('some error'))
        .put(B.aStocksPricesReceived(null))
        .next()
        .isDone();
});

