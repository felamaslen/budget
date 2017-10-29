import { Map as map } from 'immutable';
import { put } from 'redux-saga/effects';

import { aErrorOpened } from '../actions/error.actions';

import { ERROR_LEVEL_ERROR } from '../misc/const';

export function *openTimedMessage(message, level = ERROR_LEVEL_ERROR) {
    const text = message.toString();
    const errorMsg = map({ text, level });

    yield put(aErrorOpened(errorMsg));
}

