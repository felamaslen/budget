/**
 * Actions called on the editable framework
 */

import buildMessage from '../messageBuilder';
import {
  AC_EDIT_ACTIVATED, AC_EDIT_CHANGED, AC_EDIT_LIST_ITEM_ADDED,
  AC_EDIT_LIST_ITEM_DELETED,
  AC_EDIT_FUND_TRANSACTIONS_CHANGED, AC_EDIT_FUND_TRANSACTIONS_ADDED,
  AC_EDIT_FUND_TRANSACTIONS_REMOVED
} from '../constants/actions';

export const aEditableActivated = editable => buildMessage(AC_EDIT_ACTIVATED, editable);
export const aEditableChanged = value => buildMessage(AC_EDIT_CHANGED, value);
export const aListItemAdded = items => buildMessage(AC_EDIT_LIST_ITEM_ADDED, items);
export const aListItemDeleted = item => buildMessage(AC_EDIT_LIST_ITEM_DELETED, item);

export const aFundTransactionsChanged = obj => buildMessage(AC_EDIT_FUND_TRANSACTIONS_CHANGED, obj);
export const aFundTransactionsAdded = obj => buildMessage(AC_EDIT_FUND_TRANSACTIONS_ADDED, obj);
export const aFundTransactionsRemoved = obj => buildMessage(AC_EDIT_FUND_TRANSACTIONS_REMOVED, obj);

