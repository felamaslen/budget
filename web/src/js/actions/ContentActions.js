/**
 * Actions called to show/hide error messages
 */

import buildMessage from '../messageBuilder';
import { AC_CONTENT_LOADED } from '../constants/actions';

export const aContentLoaded = obj => buildMessage(AC_CONTENT_LOADED, obj);

