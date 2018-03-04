/**
 * Carries out actions for the editable framework
 */

import { List as list, Map as map } from 'immutable';
import moment from 'moment';

import { PAGES, ERROR_LEVEL_WARN } from '../misc/const';
import { ERROR_MSG_BUG_INVALID_ITEM, ERROR_MSG_BAD_DATA } from '../misc/config';
import { getNow } from '../misc/date';
import {
    getNullEditable, getAddDefaultValues, getValueForTransmit, sortRowsByDate, addWeeklyAverages
} from '../misc/data';

import { rErrorMessageOpen } from './error.reducer';
import { pushToRequestQueue } from './request-queue.reducer';
import { applyEdits, applyEditsList } from './editable-updates.reducer';
import { rCalculateOverview } from './overview.reducer';

export function rActivateEditable(reduction, { page, editable, cancel }) {
    const active = reduction.getIn(['edit', 'active']);

    let newReduction = reduction
        .setIn(['edit', 'addBtnFocus'], false)
        .setIn(['editSuggestions', 'list'], list.of())
        .setIn(['editSuggestions', 'active'], -1)
        .setIn(['editSuggestions', 'loading'], false)
        .setIn(['editSuggestions', 'reqId'], null);

    // confirm the previous item's edits
    if (active && active.get('value') !== active.get('originalValue')) {
        if (cancel) {
            // revert to previous state
            newReduction = applyEdits(newReduction, {
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
                newReduction = pushToRequestQueue(
                    newReduction,
                    active
                        .set('page', page)
                        .set('id', id)
                );
            }

            // append the changes of the last item to the UI
            newReduction = applyEdits(newReduction, { item: active, page });
        }
    }

    if (!editable) {
        // deactivate editing
        return newReduction.setIn(['edit', 'active'], getNullEditable(page));
    }

    return newReduction.setIn(
        ['edit', 'active'],
        editable.set('originalValue', editable.get('value'))
    );
}

export function rChangeEditable(reduction, { value }) {
    return reduction.setIn(['edit', 'active', 'value'], value);
}

export function getInvalidInsertDataKeys(items) {
    const itemValid = item => {
        if (item instanceof moment) {
            return true;
        }

        return item.get('value').length > 0 ||
            !['item', 'category', 'society', 'holiday'].includes(item.get('item'));
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

export function rAddListItem(reduction, { page }) {
    if (reduction.get('loadingApi')) {
        return rErrorMessageOpen(reduction, map({
            level: ERROR_LEVEL_WARN,
            text: 'Wait until the previous request has finished'
        }));
    }

    const now = getNow();

    // validate items
    const active = reduction.getIn(['edit', 'active']);
    let activeItem = null;
    let activeValue = null;
    if (active && active.get('row') === -1) {
        activeItem = active.get('item');
        activeValue = active.get('value');
    }

    const items = reduction
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
        return rErrorMessageOpen(reduction, map({
            level: ERROR_LEVEL_WARN,
            text: ERROR_MSG_BAD_DATA
        }))
            .setIn(['edit', 'addFields'], null)
            .setIn(['edit', 'addFieldsString'], null)
            .set('loadingApi', false);
    }

    const fieldsString = stringifyFields(fields);

    return rActivateEditable(reduction, { page })
        .setIn(['edit', 'add', page], getAddDefaultValues(page))
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

export function rHandleServerAdd(reduction, { response, fields, page }) {
    // handle the response from adding an item to a list page
    let newReduction = reduction.set('loadingApi', false);

    const id = response.data.id;
    const newTotal = response.data.total;

    const cols = list(fields.map(thisItem => thisItem.get('value')));

    // update total and push new item to the data store list, then sort by date
    const sortedRows = sortRowsByDate(
        reduction
            .getIn(['pages', page, 'rows'])
            .set(id, map({ id, cols })),
        page
    );

    const weeklyData = addWeeklyAverages(
        reduction.getIn(['pages', page, 'data']),
        sortedRows,
        page
    );

    newReduction = newReduction
        .setIn(['pages', page, 'rows'], sortedRows)
        .setIn(['pages', page, 'data'], weeklyData)
        .setIn(['pages', page, 'data', 'total'], newTotal)
        .setIn(
            ['pages', page, 'data', 'numRows'],
            newReduction.getIn(['pages', page, 'data', 'numRows']) + 1
        );

    // recalculate overview data
    if (reduction.getIn(['pagesLoaded', 'overview'])) {
        const costItem = fields.find(thisItem => thisItem.get('item') === 'cost');
        const dateItem = fields.find(thisItem => thisItem.get('item') === 'date');
        if (typeof costItem === 'undefined' || typeof dateItem === 'undefined') {
            return rErrorMessageOpen(newReduction, map({
                level: ERROR_LEVEL_WARN,
                text: ERROR_MSG_BUG_INVALID_ITEM
            }));
        }
        newReduction = rCalculateOverview(newReduction, {
            page,
            newDate: dateItem.get('value'),
            oldDate: dateItem.get('value'),
            newItemCost: costItem.get('value'),
            oldItemCost: 0
        });
    }

    return newReduction;
}

export function rHandleSuggestions(reduction, { items, reqId }) {
    const newReduction = reduction
        .setIn(['editSuggestions', 'loading'], false)
        .setIn(['editSuggestions', 'active'], -1);

    if (!(items && reduction.getIn(['editSuggestions', 'reqId']) === reqId)) {
        // null object (clear), or changed input while suggestions were loading
        return newReduction
            .setIn(['editSuggestions', 'list'], list.of())
            .setIn(['editSuggestions', 'reqId'], null);
    }

    const editValue = reduction
        .getIn(['edit', 'active', 'value'])
        .toLowerCase();

    return newReduction
        .setIn(['editSuggestions', 'list'], items.filter(item => item.toLowerCase() !== editValue));
}

export function rRequestSuggestions(reduction, { reqId }) {
    return reduction
        .setIn(['editSuggestions', 'loading'], true)
        .setIn(['editSuggestions', 'reqId'], reqId);
}

function getTransactionsForRow(reduction, row, col) {
    if (row > -1) {
        return reduction.getIn(['pages', 'funds', 'rows', row, 'cols', col]);
    }

    return reduction.getIn(['edit', 'add', 'funds', col]);
}

function rFundTransactions(reduction, row, col, transactions) {
    if (row > -1) {
        const item = map({
            item: 'transactions',
            row,
            col,
            value: transactions
        });

        return applyEditsList(reduction, { item, page: 'funds' })
            .setIn(
                ['edit', 'active'],
                reduction.getIn(['edit', 'active']).set('value', transactions)
            );
    }

    return reduction.setIn(
        ['edit', 'add', 'funds', col], transactions
    );
}

export function rChangeFundTransactions(reduction, { row, col, key, column, value }) {
    const transactions = getTransactionsForRow(reduction, row, col)
        .setIn([key, column], value);

    return rFundTransactions(reduction, row, col, transactions);
}

export function rAddFundTransactions(reduction, item) {
    const { row, col } = item;

    const transactions = getTransactionsForRow(reduction, row, col)
        .push(item);

    return rFundTransactions(reduction, row, col, transactions);
}

export function rRemoveFundTransactions(reduction, { row, col, key }) {
    const transactions = getTransactionsForRow(reduction, row, col)
        .remove(key);

    return rFundTransactions(reduction, row, col, transactions);
}

