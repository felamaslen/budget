/**
 * Actions called on the editable framework
 */

import { List as list } from 'immutable';
import buildMessage from '../messageBuilder';

import { uuid } from '../misc/data';

import {
    EDIT_ACTIVATED, EDIT_CHANGED, EDIT_LIST_ITEM_ADDED,
    EDIT_LIST_ITEM_DELETED,
    EDIT_FUND_TRANSACTIONS_CHANGED, EDIT_FUND_TRANSACTIONS_ADDED,
    EDIT_FUND_TRANSACTIONS_REMOVED,
    EDIT_SUGGESTIONS_REQUESTED, EDIT_SUGGESTIONS_RECEIVED
} from '../constants/actions';

import { requestSuggestions } from '../effects/suggestions.effects';

export const aEditableActivated = editable => buildMessage(EDIT_ACTIVATED, editable);
export const aEditableChanged = value => buildMessage(EDIT_CHANGED, value);
export const aListItemAdded = items => buildMessage(EDIT_LIST_ITEM_ADDED, items);
export const aListItemDeleted = item => buildMessage(EDIT_LIST_ITEM_DELETED, item);
export const aSuggestionsRequested = req => {
    if (!req.value.length) {
        return buildMessage(EDIT_SUGGESTIONS_RECEIVED, null);
    }

    return async dispatch => {
        const reqId = uuid();

        dispatch(buildMessage(EDIT_SUGGESTIONS_REQUESTED, reqId));

        try {
            const response = await requestSuggestions(req);

            const items = list(response.data.data.list);

            dispatch(buildMessage(EDIT_SUGGESTIONS_RECEIVED, { items, reqId }));
        }
        catch (err) {
            console.warn('Error loading search suggestions');
        }
    };
};

export const aFundTransactionsChanged = req => buildMessage(EDIT_FUND_TRANSACTIONS_CHANGED, req);
export const aFundTransactionsAdded = req => buildMessage(EDIT_FUND_TRANSACTIONS_ADDED, req);
export const aFundTransactionsRemoved = req => buildMessage(EDIT_FUND_TRANSACTIONS_REMOVED, req);

