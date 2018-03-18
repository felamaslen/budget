import '../browser';
import { Map as map } from 'immutable';
import { testSaga } from 'redux-saga-test-plan';
import * as S from '../../src/sagas/error.saga';
import { aErrorOpened } from '../../src/actions/error.actions';
import { ERROR_LEVEL_ERROR } from '../../src/constants/error';

describe('error.saga', () => {
    describe('openTimedMessage', () => {
        it('should notify the store of a new message', () => {
            testSaga(S.openTimedMessage, 'foo')
                .next()
                .put(aErrorOpened(map({ text: 'foo', level: ERROR_LEVEL_ERROR })))
                .next()
                .isDone();
        });

        it('should accept a level argument', () => {
            testSaga(S.openTimedMessage, 'bar', 'foo_level')
                .next()
                .put(aErrorOpened(map({ text: 'bar', level: 'foo_level' })))
                .next()
                .isDone();
        });
    });
});

