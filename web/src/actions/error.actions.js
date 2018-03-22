/**
 * Actions called to show/hide error messages
 */

import { uuid } from '../helpers/data';

import * as A from '../constants/actions';

export const aErrorOpened = message => ({ type: A.ERROR_OPENED, message, msgId: uuid() });
export const aErrorClosed = msgId => ({ type: A.ERROR_CLOSED, msgId });
export const aErrorRemoved = msgId => ({ type: A.ERROR_REMOVED, msgId });

