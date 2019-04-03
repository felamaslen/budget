/**
 * Actions called on the editable framework
 */

import * as A from '~client/constants/actions';

import { uuid } from '~client/modules/data';

export const aEditableActivated = req => ({ type: A.EDIT_ACTIVATED, ...req });
export const aEditableChanged = value => ({ type: A.EDIT_CHANGED, value });
export const aListItemAdded = req => ({ type: A.EDIT_LIST_ITEM_ADDED, ...req });
export const aListItemDeleted = item => ({ type: A.EDIT_LIST_ITEM_DELETED, ...item });
export const aSuggestionsRequested = req => ({ type: A.EDIT_SUGGESTIONS_REQUESTED, ...req, reqId: uuid() });
export const aSuggestionsReceived = res => ({ type: A.EDIT_SUGGESTIONS_RECEIVED, ...res });
export const aFundTransactionsChanged = req => ({ type: A.EDIT_FUND_TRANSACTIONS_CHANGED, ...req });
export const aFundTransactionsAdded = req => ({ type: A.EDIT_FUND_TRANSACTIONS_ADDED, ...req });
export const aFundTransactionsRemoved = req => ({ type: A.EDIT_FUND_TRANSACTIONS_REMOVED, ...req });

