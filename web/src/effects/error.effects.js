import { Map as map } from 'immutable';

import { ERROR_MESSAGE_DELAY } from '../misc/config';
import { ERROR_LEVEL_ERROR, ERROR_CLOSE_TIME } from '../misc/const';

import { aErrorOpened, aErrorClosed, aErrorRemoved } from '../actions/ErrorActions';

import { uuid } from '../misc/data';

export function openTimedMessage(dispatch, message, level = ERROR_LEVEL_ERROR) {
    const id = uuid();
    const text = message.toString();
    const errorMsg = map({ id, text, level });

    dispatch(aErrorOpened(errorMsg));

    setTimeout(() => {
        dispatch(aErrorClosed(id));
        setTimeout(() => dispatch(aErrorRemoved(id)), ERROR_CLOSE_TIME);

    }, ERROR_MESSAGE_DELAY);
}

