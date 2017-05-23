/**
 * Actions called to show/hide error messages
 */

import buildMessage from '../messageBuilder';
import { AC_ERROR_OPEN, AC_ERROR_CLOSE, AC_ERROR_REMOVE } from '../constants/actions';

export const aErrorOpened = message => buildMessage(AC_ERROR_OPEN, message);
export const aErrorClosed = msgId => buildMessage(AC_ERROR_CLOSE, msgId);
export const aErrorRemoved = msgId => buildMessage(AC_ERROR_REMOVE, msgId);

