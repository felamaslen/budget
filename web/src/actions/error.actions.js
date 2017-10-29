/**
 * Actions called to show/hide error messages
 */

import buildMessage from '../messageBuilder';

import {
    ERROR_OPENED, ERROR_CLOSED, ERROR_REMOVED
} from '../constants/actions';

export const aErrorOpened = message => buildMessage(ERROR_OPENED, message);
export const aErrorClosed = msgId => buildMessage(ERROR_CLOSED, msgId);
export const aErrorRemoved = msgId => buildMessage(ERROR_REMOVED, msgId);

