/* eslint-disable prefer-reflect */
import '../browser';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import * as S from '../../src/sagas/funds.saga';
import * as A from '../../src/actions/graph.actions';
import * as B from '../../src/actions/stocks-list.actions';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { selectApiKey } from '../../src/sagas';
import { getStockPricesFromYahoo } from '../../src/misc/finance';

describe('funds.saga', () => {
    describe('selectFundHistoryCache', () => {
        it('should get the fundHistoryCache', () => {
            expect(S.selectFundHistoryCache(fromJS({
                other: {
                    fundHistoryCache: 'foo'
                }
            }))).to.equal('foo');
        });
    });

    describe('requestFundPeriodData', () => {
        it('should do nothing if loading from the cache', () => {
            testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
                .next()
                .select(S.selectFundHistoryCache)
                .next(fromJS({ foo: 'bar' }))
                .isDone();
        });

        it('should request new data', () => {
            testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
                .next()
                .select(S.selectFundHistoryCache)
                .next(fromJS({}))
                .select(selectApiKey)
                .next('some_api_key')
                .call(axios.get, 'api/v3/data/funds?period=year&length=1&history=true', {
                    headers: { Authorization: 'some_api_key' }
                })
                .next({ data: { data: 'yes' } })
                .put(A.aFundsGraphPeriodReceived({
                    shortPeriod: 'foo', data: 'yes', reloadPagePrices: false
                }))
                .next()
                .isDone();
        });

        it('should handle errors', () => {
            testSaga(S.requestFundPeriodData, { noCache: false, shortPeriod: 'foo', reloadPagePrices: false })
                .next()
                .select(S.selectFundHistoryCache)
                .next(fromJS({}))
                .select(selectApiKey)
                .next('some_api_key')
                .call(axios.get, 'api/v3/data/funds?period=year&length=1&history=true', {
                    headers: { Authorization: 'some_api_key' }
                })
                .throw(new Error('some error'))
                .call(openTimedMessage, 'Error loading fund data')
                .next()
                .isDone();
        });
    });

    describe('selectStocksListInfo', () => {
        it('should return stocks and indices', () => {
            expect(S.selectStocksListInfo(fromJS({
                other: {
                    stocksList: {
                        stocks: 'foo',
                        indices: 'bar'
                    }
                }
            }))).to.deep.equal({
                stocks: 'foo',
                indices: 'bar'
            });
        });
    });

    describe('requestStocksPrices', () => {
        it('should request stock prices', () => {
            testSaga(S.requestStocksPrices)
                .next()
                .select(S.selectStocksListInfo)
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
                .select(S.selectStocksListInfo)
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

