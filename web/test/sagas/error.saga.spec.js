import test from 'ava';
import '~client-test/browser';
import { Map as map } from 'immutable';
import { testSaga } from 'redux-saga-test-plan';
import * as S from '~client/sagas/error.saga';
import { aErrorOpened } from '~client/actions/error.actions';
import { ERROR_LEVEL_ERROR } from '~client/constants/error';

test('openTimedMessage notifying the store of a new message', t => {
    t.is(1, 1);
    testSaga(S.openTimedMessage, 'foo')
        .next()
        .put(aErrorOpened(map({ text: 'foo', level: ERROR_LEVEL_ERROR })))
        .next()
        .isDone();
});

test('openTimedMessage accepting a level argument', t => {
    t.is(1, 1);
    testSaga(S.openTimedMessage, 'bar', 'foo_level')
        .next()
        .put(aErrorOpened(map({ text: 'bar', level: 'foo_level' })))
        .next()
        .isDone();
});

