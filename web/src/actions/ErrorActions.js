/**
 * Actions called to show/hide error messages
 */

import buildMessage from '../messageBuilder';
import {
    ERROR_OPEN, ERROR_CLOSE, ERROR_REMOVE, ERRORS_TIMEDOUT
} from '../constants/actions';

export const aErrorOpened = message => buildMessage(ERROR_OPEN, message);
export const aErrorClosed = msgId => buildMessage(ERROR_CLOSE, msgId);
export const aErrorRemoved = msgId => buildMessage(ERROR_REMOVE, msgId);
export const aErrorsTimedout = () => buildMessage(ERRORS_TIMEDOUT);

