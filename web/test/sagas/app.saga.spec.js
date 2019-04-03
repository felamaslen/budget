/* eslint-disable prefer-reflect */
import '~client-test/browser';
import { DateTime } from 'luxon';
import { delay } from 'redux-saga';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';
import {
    watchEventEmitter,
    windowResizeEventChannel,
    updateServerData,
    addServerDataRequest,
    addServerData,
    timeUpdater
} from '~client/sagas/app.saga';
import { getApiKey, getRequestList, getAddData } from '~client/selectors/app';
import { openTimedMessage } from '~client/sagas/error.saga';
import { aWindowResized, aServerUpdateReceived, aServerAddReceived, aTimeUpdated } from '~client/actions/app.actions';

describe('app.saga', () => {
    describe('watchEventEmitter', () => {
        it('should dispatch an action emitted by the channel', () => {
            const channel = windowResizeEventChannel();

            testSaga(watchEventEmitter, windowResizeEventChannel)
                .next()
                .call(windowResizeEventChannel)
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
            testSaga(updateServerData)
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
            testSaga(updateServerData)
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
            testSaga(addServerDataRequest, { item: 'foo', fields: ['bar'], page: 'bills' })
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
            testSaga(addServerDataRequest, { item: 'foo', fields: ['bar'], page: 'bills' })
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
            testSaga(addServerData, { page: 'page1' })
                .next()
                .select(getAddData)
                .next({ fields: 'foo', item: 'bar' })
                .call(addServerDataRequest, { page: 'page1', fields: 'foo', item: 'bar' })
                .next()
                .isDone();

        });
    });

    describe('timeUpdater', () => {
        it('should periodically call the time updater action', () => {
            const date = new Date(150000000);

            testSaga(timeUpdater)
                .next()
                .call(delay, 1000)
                .next()
                .call(DateTime.local)
                .next(date)
                .put(aTimeUpdated(date))
                .next()
                .call(delay, 1000)
                .next()
                .call(DateTime.local);

            // etc.
        });
    });
});

