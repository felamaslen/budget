/**
 * Actions called on the editable framework
 */

import buildMessage from '../messageBuilder';
import {
  AC_EDIT_ACTIVATED, AC_EDIT_CHANGED
} from '../constants/actions';

export const aEditableActivated = editable => buildMessage(AC_EDIT_ACTIVATED, editable);
export const aEditableChanged = value => buildMessage(AC_EDIT_CHANGED, value);

