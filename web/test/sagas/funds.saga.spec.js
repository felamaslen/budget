/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import '../browser';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { select, call, put } from 'redux-saga/effects';
import axios from 'axios';
import { getStockPricesFromYahoo } from '../../src/misc/finance';

import * as S from '../../src/sagas/funds.saga';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { selectApiKey } from '../../src/sagas';

import { aFundsGraphPeriodReceived } from '../../src/actions/graph.actions';
import { aStocksListReceived, aStocksPricesReceived } from '../../src/actions/stocks-list.actions';

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
        it('should select whether to load data from the cache', () => {
            const iter = S.requestFundPeriodData({
                payload: { noCache: false, shortPeriod: 'foo' }
            });

            expect(iter.next().value).to.deep.equal(select(S.selectFundHistoryCache));
        });
        it('should do nothing if loading from the cache', () => {
            const iter = S.requestFundPeriodData({ payload: { shortPeriod: 'foo', noCache: false } });
            iter.next();
            expect(iter.next(fromJS({ foo: 'bar' })).value).to.be.undefined;
        });

        const iter = S.requestFundPeriodData({
            payload: {
                shortPeriod: 'foo',
                reloadPagePrices: 'bar',
                noCache: true
            }
        });
        let next = iter.next();
        next = iter.next(fromJS({}));

        it('should select the API key', () => {
            expect(next.value).to.deep.equal(select(selectApiKey));
            next = iter.next('some_api_key');
        });
        it('should call the API', () => {
            expect(next.value).to.deep.equal(call(
                axios.get,
                'api/v3/data/funds?period=year&length=1&history=true',
                { headers: { 'Authorization': 'some_api_key' } }
            ));
            next = iter.next({ data: { data: 'baz' } });
        });
        describe('if there was no error from the API', () => {
            it('should notify the store that the period data has changed', () => {
                expect(next.value).to.deep.equal(put(aFundsGraphPeriodReceived({
                    reloadPagePrices: 'bar',
                    shortPeriod: 'foo',
                    data: 'baz'
                })));
            });
        });
        describe('otherwise', () => {
            it('should issue an error message', () => {
                const iter2 = S.requestFundPeriodData({
                    payload: {
                        shortPeriod: 'foo',
                        reloadPagePrices: 'bar',
                        noCache: true
                    }
                });

                iter2.next();
                iter2.next(fromJS({}));
                iter2.next('some_api_key');

                expect(iter2.throw('some error').value).to.deep.equal(call(
                    openTimedMessage, 'Error loading fund data'
                ));
            });
        });
    });

    describe('requestStocksList', () => {
        const iter = S.requestStocksList();
        let next = iter.next();

        it('should select the api key', () => {
            expect(next.value).to.deep.equal(select(selectApiKey));
            next = iter.next('some_api_key');
        });
        it('should call the API', () => {
            expect(next.value).to.deep.equal(call(axios.get, 'api/v3/data/stocks', {
                headers: { 'Authorization': 'some_api_key' }
            }));
            next = iter.next({ data: { data: [1, 2, 3] } });
        });
        describe('if the API didn\'t return an error', () => {
            it('should notify the store of the stocks list data', () => {
                expect(next.value).to.deep.equal(put(aStocksListReceived([1, 2, 3])));
            });
        });
        describe('otherwise', () => {
            it('should notify the store of null stocks list data', () => {
                const iter2 = S.requestStocksList();

                iter2.next();
                iter2.next('some_api_key');

                expect(iter2.throw('some error').value).to.deep.equal(put(aStocksListReceived(null)));
            });
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
        const iter = S.requestStocksPrices();
        let next = iter.next();

        it('should select the stock symbols and indices', () => {
            expect(next.value).to.deep.equal(select(S.selectStocksListInfo));
            next = iter.next({
                stocks: fromJS([1, 2, 3]),
                indices: fromJS([{ code: 4 }, { code: 5 }])
            });
        });
        it('should call the API', () => {
            expect(next.value).to.deep.equal(call(getStockPricesFromYahoo, fromJS([0, 1, 2, 4, 5])));

            next = iter.next([1, 2, 3]);
        });
        describe('if the API didn\'t return an error', () => {
            it('should notify the store of the stocks list data', () => {
                expect(next.value).to.deep.equal(put(aStocksPricesReceived([1, 2, 3])));
            });
        });
        describe('otherwise', () => {
            it('should notify the store of null stocks list data', () => {
                const iter2 = S.requestStocksPrices();

                iter2.next();
                iter2.next({
                    stocks: fromJS([1, 2, 3]),
                    indices: fromJS([{ code: 4 }, { code: 5 }])
                });

                expect(iter2.throw('some error').value).to.deep.equal(put(aStocksPricesReceived(null)));
            });
        });
    });
});

