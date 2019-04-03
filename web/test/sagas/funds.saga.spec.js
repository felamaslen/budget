/* eslint-disable prefer-reflect */
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

describe('funds.saga', () => {
    describe('requestFundPeriodData', () => {
        let envBefore = null;
        before(() => {
            envBefore = process.env.DEFAULT_FUND_PERIOD;

            process.env.DEFAULT_FUND_PERIOD = 'year1';
        });

        after(() => {
            process.env.DEFAULT_FUND_PERIOD = envBefore;
        });

        it('should do nothing if loading from the cache', () => {
            testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
                .next()
                .select(getFundsCache)
                .next(fromJS({ foo: 'bar' }))
                .isDone();
        });

        it('should request new data', () => {
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

        it('should handle errors', () => {
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
    });

    describe('requestStocksPrices', () => {
        it('should request stock prices', () => {
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

        it('should handle errors', () => {
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
    });
});

