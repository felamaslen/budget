import { Map as map } from 'immutable';
import { put } from 'redux-saga/effects';

import { aErrorOpened } from '../actions/ErrorActions';

import { uuid } from '../misc/data';
import { ERROR_LEVEL_ERROR } from '../misc/const';

export function *openTimedMessage(message, level = ERROR_LEVEL_ERROR) {
    const id = uuid();
    const text = message.toString();
    const errorMsg = map({ id, text, level });

    yield put(aErrorOpened(errorMsg));
}

