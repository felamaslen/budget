/**
 * Actions called to show/hide error messages
 */

import buildMessage from '../messageBuilder';

import { ERROR_MESSAGE_DELAY } from '../misc/config';
import { ERROR_CLOSE_TIME } from '../misc/const';

import { uuid } from '../misc/data';

import {
    ERROR_OPENED, ERROR_CLOSED, ERROR_REMOVED
} from '../constants/actions';

function messageHidden(msgId) {
    return new Promise(resolve => {
        setTimeout(() => resolve(buildMessage(ERROR_CLOSED, msgId)), ERROR_MESSAGE_DELAY);
    });
}

function messageRemoved(msgId) {
    return new Promise(resolve => {
        setTimeout(() => resolve(buildMessage(ERROR_REMOVED, msgId)), ERROR_CLOSE_TIME);
    });
}

export const aErrorOpened = message => {
    return async dispatch => {
        const msgId = uuid();

        dispatch(buildMessage(ERROR_OPENED, message.set('id', msgId)));

        const actionMessageHidden = await messageHidden(msgId);
        dispatch(actionMessageHidden);

        const actionMessageRemoved = await messageRemoved(msgId);
        dispatch(actionMessageRemoved);
    };
}

export const aErrorClosed = msgId => {
    return async dispatch => {
        dispatch(buildMessage(ERROR_CLOSED, msgId));

        const actionMessageRemoved = await messageRemoved(msgId);
        dispatch(actionMessageRemoved);
    };
};

