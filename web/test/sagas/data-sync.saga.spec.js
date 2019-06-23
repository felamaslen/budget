/* eslint-disable prefer-reflect */
import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';
import { List as list } from 'immutable';

import dataSyncSaga, {
    loopDataSync
} from '~client/sagas/data-sync.saga';

import { TIMER_UPDATE_SERVER } from '~client/constants/data';
import { aSettingsLoaded, aServerUpdated } from '~client/actions/app.actions';
import { getRawRequestList } from '~client/selectors/app';

test('loopDataSync continuously checks request list size and dispatches SERVER_UPDATED', t => {
    t.is(1, 1);
    testSaga(loopDataSync)
        .next()
        .delay(TIMER_UPDATE_SERVER)
        .next()
        .select(getRawRequestList)
        .next(list.of())
        .delay(TIMER_UPDATE_SERVER)
        .next()
        .select(getRawRequestList)
        .next(list.of(1, 2))
        .put(aServerUpdated())
        .next()
        .delay(TIMER_UPDATE_SERVER)
        .next()
        .select(getRawRequestList)
        .next(list.of(1, 3, 5))
        .put(aServerUpdated())
        .next()
        .delay(TIMER_UPDATE_SERVER)
        .next()
        .select(getRawRequestList)
        .next(list.of(1, 3, 5))
        .delay(TIMER_UPDATE_SERVER)
        .next()
        .select(getRawRequestList);
});

test('dataSyncSaga gets settings and forks data loop saga', t => {
    t.is(1, 1);
    testSaga(dataSyncSaga)
        .next()
        .put(aSettingsLoaded())
        .next()
        .fork(loopDataSync)
        .next()
        .isDone();
});
