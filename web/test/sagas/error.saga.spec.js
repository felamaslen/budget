import '~client-test/browser.js';
import { Map as map } from 'immutable';
import { testSaga } from 'redux-saga-test-plan';
import * as S from '~client/sagas/error.saga';
import { aErrorOpened } from '~client/actions/error.actions';
import { ERROR_LEVEL_ERROR } from '~client/constants/error';

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

