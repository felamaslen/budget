/**
 * Carries out actions for the editable framework
 */

import { List as list, Map as map } from 'immutable';
import { compose } from 'redux';
import { DateTime } from 'luxon';
import { PAGES } from '../constants/data';
import { ERROR_MSG_BUG_INVALID_ITEM, ERROR_MSG_BAD_DATA, ERROR_LEVEL_WARN } from '../constants/error';
import { getNullEditable, getAddDefaultValues, getValueForTransmit, resortListRows } from '../helpers/data';
import { getNow } from '../selectors/app';
import { rErrorMessageOpen } from './error.reducer';
import { pushToRequestQueue } from './request-queue.reducer';
import { applyEdits, applyEditsList } from './editable-updates.reducer';
import { rCalculateOverview } from './overview.reducer';

export function rActivateEditable(state, { page, editable, cancel }) {
    const active = state.getIn(['edit', 'active']);

    let nextState = state
        .setIn(['edit', 'addBtnFocus'], false)
        .setIn(['editSuggestions', 'list'], list.of())
        .setIn(['editSuggestions', 'active'], -1)
        .setIn(['editSuggestions', 'loading'], false)
        .setIn(['editSuggestions', 'reqId'], null);

    // confirm the previous item's edits
    if (active && active.get('value') !== active.get('originalValue')) {
        if (cancel) {
            // revert to previous state
            nextState = applyEdits(nextState, {
                item: active.set('value', active.get('originalValue')),
                page
            });
        }
        else {
            if (active.get('row') > -1) {
                const id = active.has('id')
                    ? active.get('id')
                    : active.get('row');

                // add last update to API queue
                nextState = pushToRequestQueue(
                    nextState,
                    active
                        .set('page', page)
                        .set('id', id)
                );
            }

            // append the changes of the last item to the UI
            nextState = applyEdits(nextState, { item: active, page });
        }
    }

    if (!editable) {
        // deactivate editing
        return nextState.setIn(['edit', 'active'], getNullEditable(page));
    }

    return nextState.setIn(
        ['edit', 'active'],
        editable.set('originalValue', editable.get('value'))
    );
}

export function rChangeEditable(state, { value }) {
    return state.setIn(['edit', 'active', 'value'], value);
}

export function getInvalidInsertDataKeys(items) {
    const itemValid = item => {
        if (item instanceof DateTime) {
            return true;
        }

        if (item && typeof item.get === 'function') {
            return item.get('value').length > 0 ||
                !['item', 'category', 'society', 'holiday'].includes(item.get('item'));
        }

        return false;
    };

    return items.reduce((keys, item, itemKey) => {
        if (!itemValid(item)) {
            return keys.push(itemKey);
        }

        return keys;

    }, list.of());
}

export function stringifyFields(fields) {
    return fields
        .reduce((result, thisItem) => ({
            ...result,
            [thisItem.get('item')]: getValueForTransmit(thisItem.get('value'))
        }), {});
}

export function rAddListItem(state, { page }) {
    if (state.get('loadingApi')) {
        return rErrorMessageOpen(state, map({
            level: ERROR_LEVEL_WARN,
            text: 'Wait until the previous request has finished'
        }));
    }

    const now = getNow(state);

    // validate items
    const active = state.getIn(['edit', 'active']);
    let activeItem = null;
    let activeValue = null;
    if (active && active.get('row') === -1) {
        activeItem = active.get('item');
        activeValue = active.get('value');
    }

    const items = state
        .getIn(['edit', 'add', page])
        .map((value, key) => ({
            item: PAGES[page].cols[key],
            value
        }));

    const fields = items.map(({ item, value }) => map({
        item,
        value: item === activeItem
            ? activeValue
            : value
    }));

    const invalidKeys = getInvalidInsertDataKeys(fields);
    const valid = invalidKeys.size === 0;

    if (!valid) {
        return rErrorMessageOpen(state, map({
            level: ERROR_LEVEL_WARN,
            text: ERROR_MSG_BAD_DATA
        }))
            .setIn(['edit', 'addFields'], null)
            .setIn(['edit', 'addFieldsString'], null)
            .set('loadingApi', false);
    }

    const fieldsString = stringifyFields(fields);

    return rActivateEditable(state, { page })
        .setIn(['edit', 'add', page], getAddDefaultValues(page, now))
        .setIn(['edit', 'addFields'], fields)
        .setIn(['edit', 'addFieldsString'], fieldsString)
        .setIn(['edit', 'active'], map({
            row: -1,
            col: 0,
            page,
            id: null,
            item: 'date',
            value: now,
            originalValue: now
        }))
        .setIn(['edit', 'addBtnFocus'], false)
        .set('loadingApi', true);
}

export const updateTotal = (page, total) => state => state
    .setIn(['pages', page, 'data', 'total'], total);

function addRows(page, id, cols) {
    return state => state.setIn(['pages', page, 'rows', id], map({ id, cols }));
}

function addOverviewData(page, fields) {
    const costItem = fields.find(thisItem => thisItem.get('item') === 'cost');
    const dateItem = fields.find(thisItem => thisItem.get('item') === 'date');

    if (typeof costItem === 'undefined' || typeof dateItem === 'undefined') {
        return state => rErrorMessageOpen(state, map({
            level: ERROR_LEVEL_WARN,
            text: ERROR_MSG_BUG_INVALID_ITEM
        }));
    }

    return rCalculateOverview({
        page,
        newDate: dateItem.get('value'),
        oldDate: dateItem.get('value'),
        newItemCost: costItem.get('value'),
        oldItemCost: 0
    });
}

export function rHandleServerAdd(state, { err, response, fields, page }) {
    // handle the response from adding an item to a list page
    const nextState = state.set('loadingApi', false);
    if (err) {
        return nextState;
    }

    const id = response.data.id;

    const cols = list(fields.map(thisItem => thisItem.get('value')));

    return compose(
        addOverviewData(page, fields),
        resortListRows(page),
        updateTotal(page, response.data.total),
        addRows(page, id, cols)
    )(nextState);
}

export function rHandleSuggestions(state, { data, reqId }) {
    const nextState = state
        .setIn(['editSuggestions', 'loading'], false)
        .setIn(['editSuggestions', 'active'], -1);

    if (!(data && state.getIn(['editSuggestions', 'reqId']) === reqId)) {
        // null object (clear), or changed input while suggestions were loading
        return nextState
            .setIn(['editSuggestions', 'list'], list.of())
            .setIn(['editSuggestions', 'reqId'], null)
            .setIn(['editSuggestions', 'nextCategory'], null);
    }

    const { list: items, nextCategory } = data;

    return nextState
        .setIn(['editSuggestions', 'list'], list(items))
        .setIn(['editSuggestions', 'nextCategory'], list(nextCategory || []));
}

export function rRequestSuggestions(state, { reqId }) {
    return state
        .setIn(['editSuggestions', 'loading'], true)
        .setIn(['editSuggestions', 'reqId'], reqId);
}

function getTransactionsForRow(state, row, col) {
    if (row > -1) {
        return state.getIn(['pages', 'funds', 'rows', row, 'cols', col]);
    }

    return state.getIn(['edit', 'add', 'funds', col]);
}

function rFundTransactions(state, row, col, transactions) {
    if (row > -1) {
        const item = map({
            item: 'transactions',
            row,
            col,
            value: transactions
        });

        return applyEditsList(state, { item, page: 'funds' })
            .setIn(['edit', 'active'], state.getIn(['edit', 'active'])
                .set('value', transactions)
            );
    }

    return state.setIn(['edit', 'add', 'funds', col], transactions);
}

export function rChangeFundTransactions(state, { row, col, key, column, value }) {
    const transactions = getTransactionsForRow(state, row, col)
        .setIn([key, column], value);

    return rFundTransactions(state, row, col, transactions);
}

export function rAddFundTransactions(state, item) {
    const { row, col } = item;

    const transactions = getTransactionsForRow(state, row, col)
        .push(item);

    return rFundTransactions(state, row, col, transactions);
}

export function rRemoveFundTransactions(state, { row, col, key }) {
    const transactions = getTransactionsForRow(state, row, col)
        .remove(key);

    return rFundTransactions(state, row, col, transactions);
}

