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

import { SUGGESTIONS_REQUESTED, SERVER_ADD_REQUESTED } from '../constants/effects';

import { uuid } from '../misc/data';

export const aEditableActivated = req => buildMessage(EDIT_ACTIVATED, req);
export const aEditableChanged = value => buildMessage(EDIT_CHANGED, value);
export const aListItemAdded = req => buildMessage(
    EDIT_LIST_ITEM_ADDED, req, SERVER_ADD_REQUESTED
);
export const aListItemDeleted = item => buildMessage(EDIT_LIST_ITEM_DELETED, item);
export const aSuggestionsRequested = req => buildMessage(
    EDIT_SUGGESTIONS_REQUESTED,
    Object.assign({}, req, { reqId: uuid() }),
    SUGGESTIONS_REQUESTED
);
export const aSuggestionsReceived = res => buildMessage(EDIT_SUGGESTIONS_RECEIVED, res);
export const aFundTransactionsChanged = req => buildMessage(EDIT_FUND_TRANSACTIONS_CHANGED, req);
export const aFundTransactionsAdded = req => buildMessage(EDIT_FUND_TRANSACTIONS_ADDED, req);
export const aFundTransactionsRemoved = req => buildMessage(EDIT_FUND_TRANSACTIONS_REMOVED, req);

