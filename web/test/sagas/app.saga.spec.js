/* eslint-disable prefer-reflect */
import '../browser';
import { delay } from 'redux-saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';
import appSaga, * as S from '../../src/sagas/app.saga';
import { EDIT_LIST_ITEM_ADDED, SERVER_UPDATED } from '../../src/constants/actions';
import { getApiKey, getRequestList, getAddData } from '../../src/selectors/app';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { aWindowResized, aServerUpdateReceived, aServerAddReceived, aTimeUpdated } from '../../src/actions/app.actions';

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

    describe('updateServerData', () => {
        it('should work as expected', () => {
            testSaga(S.updateServerData)
                .next()
                .select(getApiKey)
                .next('some_api_key')
                .select(getRequestList)
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
                .select(getApiKey)
                .next('some_api_key')
                .select(getRequestList)
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
                .select(getApiKey)
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
                .select(getApiKey)
                .next('some_api_key')
                .call(axios.post, 'api/v4/data/bills', 'foo', {
                    headers: { Authorization: 'some_api_key' }
                })
                .throw(new Error('some error'))
                .call(openTimedMessage, 'Error adding data to server!')
                .next()
                .put(aServerAddReceived({ err: new Error('some error') }))
                .next()
                .isDone();
        });
    });

    describe('addServerData', () => {
        it('should work as expected', () => {
            testSaga(S.addServerData, { page: 'page1' })
                .next()
                .select(getAddData)
                .next({ fields: 'foo', item: 'bar' })
                .call(S.addServerDataRequest, { page: 'page1', fields: 'foo', item: 'bar' })
                .next()
                .isDone();

        });
    });

    describe('timeUpdater', () => {
        it('should periodically call the time updater action', () => {
            const date = new Date(150000000);

            testSaga(S.timeUpdater)
                .next()
                .call(delay, 1000)
                .next()
                .call(S.getDate)
                .next(date)
                .put(aTimeUpdated(date))
                .next()
                .call(delay, 1000)
                .next()
                .call(S.getDate);

            // etc.
        });
    });

    describe('appSaga', () => {
        it('should yield all the other sagas', () => {
            testSaga(appSaga)
                .next()
                .fork(S.timeUpdater)
                .next()
                .fork(S.watchEventEmitter, S.keyPressEventChannel)
                .next()
                .fork(S.watchEventEmitter, S.windowResizeEventChannel)
                .next()
                .fork(takeEvery, [EDIT_LIST_ITEM_ADDED, S.addServerData])
                .next()
                .fork(takeLatest, [SERVER_UPDATED, S.updateServerData])
                .next()
                .isDone();
        });
    });
});

