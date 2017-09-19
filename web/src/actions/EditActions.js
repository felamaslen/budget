/**
 * Actions called on the editable framework
 */

import buildMessage from '../messageBuilder';
import {
    EDIT_ACTIVATED, EDIT_CHANGED, EDIT_LIST_ITEM_ADDED,
    EDIT_LIST_ITEM_DELETED,
    EDIT_FUND_TRANSACTIONS_CHANGED, EDIT_FUND_TRANSACTIONS_ADDED,
    EDIT_FUND_TRANSACTIONS_REMOVED,
    EDIT_SUGGESTIONS_REQUESTED, EDIT_SUGGESTIONS_RECEIVED
} from '../constants/actions';

export const aEditableActivated = editable => buildMessage(EDIT_ACTIVATED, editable);
export const aEditableChanged = value => buildMessage(EDIT_CHANGED, value);
export const aListItemAdded = items => buildMessage(EDIT_LIST_ITEM_ADDED, items);
export const aListItemDeleted = item => buildMessage(EDIT_LIST_ITEM_DELETED, item);
export const aSuggestionsRequested = value => buildMessage(EDIT_SUGGESTIONS_REQUESTED, value);
export const aSuggestionsReceived = response => buildMessage(EDIT_SUGGESTIONS_RECEIVED, response);

export const aFundTransactionsChanged = obj => buildMessage(EDIT_FUND_TRANSACTIONS_CHANGED, obj);
export const aFundTransactionsAdded = obj => buildMessage(EDIT_FUND_TRANSACTIONS_ADDED, obj);
export const aFundTransactionsRemoved = obj => buildMessage(EDIT_FUND_TRANSACTIONS_REMOVED, obj);

