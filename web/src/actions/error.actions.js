/**
 * Actions called to show/hide error messages
 */

import { uuid } from '~client/helpers/data';

import * as A from '~client/constants/actions';

export const aErrorOpened = message => ({ type: A.ERROR_OPENED, message, msgId: uuid() });
export const aErrorClosed = msgId => ({ type: A.ERROR_CLOSED, msgId });
export const aErrorRemoved = msgId => ({ type: A.ERROR_REMOVED, msgId });

