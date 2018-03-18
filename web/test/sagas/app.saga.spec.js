/* eslint-disable prefer-reflect */
import { fromJS } from 'immutable';
import '../browser';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';
import * as S from '../../src/sagas/app.saga';
import { selectApiKey } from '../../src/sagas';
import { openTimedMessage } from '../../src/sagas/error.saga';

import { aWindowResized, aServerUpdateReceived, aServerAddReceived } from '../../src/actions/app.actions';

describe('app.saga', () => {
    describe('watchEventEmitter', () => {
        it('should dispatch an action emitted by the channel', () => {
            const channel = S.windowResizeEventChannel();

            testSaga(S.watchEventEmitter, S.windowResizeEventChannel)
                .next()
                .call(S.windowResizeEventChannel)
                .next(channel)
                .take(channel)
                .next(aWindowResized(100))
                .put(aWindowResized(100))
                .next()
                .take(channel)
                .next(aWindowResized(105))
                .put(aWindowResized(105));
        });
    });

    describe('selectRequestList', () => {
        it('should get the requestList and map it to each request', () => {
            expect(S.selectRequestList(fromJS({
                edit: {
                    requestList: [{ req: 1, foo: 'bar' }, { req: 2, bar: 'baz' }]
                }
            })).toJS()).to.deep.equal([1, 2]);
        });
    });

    describe('updateServerData', () => {
        it('should work as expected', () => {
            testSaga(S.updateServerData)
                .next()
                .select(selectApiKey)
                .next('some_api_key')
                .select(S.selectRequestList)
                .next([{ req1: 'foo' }])
                .call(axios.patch, 'api/v4/data/multiple', {
                    list: [{ req1: 'foo' }]
                }, {
                    headers: { Authorization: 'some_api_key' }
                })
                .next({ data: 'something' })
                .put(aServerUpdateReceived({ data: 'something' }))
                .next()
                .isDone();
        });

        it('should handle errors', () => {
            testSaga(S.updateServerData)
                .next()
                .select(selectApiKey)
                .next('some_api_key')
                .select(S.selectRequestList)
                .next([{ req1: 'foo' }])
                .call(axios.patch, 'api/v4/data/multiple', {
                    list: [{ req1: 'foo' }]
                }, {
                    headers: { Authorization: 'some_api_key' }
                })
                .throw(new Error('some error'))
                .call(openTimedMessage, 'Error updating data on server!')
                .next()
                .put(aServerUpdateReceived(null))
                .next()
                .isDone();
        });
    });

    describe('addServerDataRequest', () => {
        it('should work as expected', () => {
            testSaga(S.addServerDataRequest, { item: 'foo', fields: ['bar'], page: 'bills' })
                .next()
                .select(selectApiKey)
                .next('some_api_key')
                .call(axios.post, 'api/v4/data/bills', 'foo', {
                    headers: { Authorization: 'some_api_key' }
                })
                .next({ data: 'something' })
                .put(aServerAddReceived({ response: { data: 'something' }, fields: ['bar'], page: 'bills' }))
                .next()
                .isDone();
        });

        it('should handle errors', () => {
            testSaga(S.addServerDataRequest, { item: 'foo', fields: ['bar'], page: 'bills' })
                .next()
                .select(selectApiKey)
                .next('some_api_key')
                .call(axios.post, 'api/v4/data/bills', 'foo', {
                    headers: { Authorization: 'some_api_key' }
                })
                .throw(new Error('some error'))
                .call(openTimedMessage, 'Error adding data to server!')
                .next()
                .isDone();
        });
    });

    describe('selectAddData', () => {
        it('should get the fields and item', () => {
            expect(S.selectAddData(fromJS({
                edit: {
                    addFields: 'foo',
                    addFieldsString: 'bar'
                }
            }))).to.deep.equal({ fields: 'foo', item: 'bar' });
        });
    });

    describe('addServerData', () => {
        it('should work as expected', () => {
            testSaga(S.addServerData, { page: 'page1' })
                .next()
                .select(S.selectAddData)
                .next({ fields: 'foo', item: 'bar' })
                .call(S.addServerDataRequest, { page: 'page1', fields: 'foo', item: 'bar' })
                .next()
                .isDone();

        });
    });
});

