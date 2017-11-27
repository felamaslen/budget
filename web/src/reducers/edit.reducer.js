/**
 * Carries out actions for the editable framework
 */

import { List as list, Map as map } from 'immutable';

import { PAGES, LIST_COLS_PAGES, ERROR_LEVEL_WARN } from '../misc/const';
import { ERROR_MSG_BUG_INVALID_ITEM, ERROR_MSG_BAD_DATA } from '../misc/config';
import { YMD } from '../misc/date';
import {
    getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages
} from '../misc/data';

import { rErrorMessageOpen } from './error.reducer';
import { pushToRequestQueue } from './request-queue.reducer';
import { applyEdits, applyEditsList } from './editable-updates.reducer';
import { rCalculateOverview } from './overview.reducer';

const overviewKey = PAGES.indexOf('overview');

export function rActivateEditable(reduction, { pageIndex, editable, cancel }) {
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
            newReduction = applyEdits(
                newReduction, active.set('value', active.get('originalValue'))
            );
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
                        .set('pageIndex', pageIndex)
                        .set('id', id)
                );
            }

            // append the changes of the last item to the UI
            newReduction = applyEdits(newReduction, active, pageIndex);
        }
    }

    if (!editable) {
        // deactivate editing
        return newReduction.setIn(['edit', 'active'], getNullEditable(pageIndex));
    }

    return newReduction.setIn(
        ['edit', 'active'],
        editable.set('originalValue', editable.get('value'))
    );
}

export function rChangeEditable(reduction, value) {
    return reduction.setIn(['edit', 'active', 'value'], value);
}

export function getInvalidInsertDataKeys(items) {
    return items.reduce((keys, item, itemKey) => {
        const itemValid = item.valid || item.get('value').length > 0 ||
            ['item', 'category', 'society', 'holiday'].indexOf(item.get('item')) === -1;

        if (itemValid) {
            return keys;
        }

        return keys.push(itemKey);
    }, list.of());
}

export function stringifyFields(fields) {
    return fields
        .reduce((obj, thisItem) => {
            obj[thisItem.get('item')] = thisItem
                .get('value')
                .toString();

            return obj;
        }, {});
}

export function rAddListItem(reduction, { pageIndex }) {
    if (reduction.get('loadingApi')) {
        return rErrorMessageOpen(reduction, map({
            level: ERROR_LEVEL_WARN,
            text: 'Wait until the previous request has finished'
        }));
    }

    const now = new YMD();

    // validate items
    const active = reduction.getIn(['edit', 'active']);
    let activeItem = null;
    let activeValue = null;
    if (active && active.get('row') === -1) {
        activeItem = active.get('item');
        activeValue = active.get('value');
    }

    const items = reduction
        .getIn(['edit', 'add', pageIndex])
        .map((value, key) => ({
            item: LIST_COLS_PAGES[pageIndex][key],
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

    return rActivateEditable(reduction, { pageIndex })
        .setIn(['edit', 'add', pageIndex], getAddDefaultValues(pageIndex))
        .setIn(['edit', 'addFields'], fields)
        .setIn(['edit', 'addFieldsString'], fieldsString)
        .setIn(['edit', 'active'], map({
            row: -1,
            col: 0,
            pageIndex,
            id: null,
            item: 'date',
            value: now,
            originalValue: now
        }))
        .setIn(['edit', 'addBtnFocus'], false)
        .set('loadingApi', true);
}

export function rHandleServerAdd(reduction, { response, fields, pageIndex }) {
    // handle the response from adding an item to a list page
    let newReduction = reduction.set('loadingApi', false);

    const id = response.data.id;
    const newTotal = response.data.total;

    const cols = list(fields.map(thisItem => thisItem.get('value')));

    // update total and push new item to the data store list, then sort by date
    const sortedRows = sortRowsByDate(
        reduction
            .getIn(['pages', pageIndex, 'rows'])
            .set(id, map({ id, cols })),
        pageIndex
    );

    const weeklyData = addWeeklyAverages(
        reduction.getIn(['pages', pageIndex, 'data']),
        sortedRows,
        pageIndex
    );

    newReduction = newReduction
        .setIn(['pages', pageIndex, 'rows'], sortedRows)
        .setIn(['pages', pageIndex, 'data'], weeklyData)
        .setIn(['pages', pageIndex, 'data', 'total'], newTotal)
        .setIn(
            ['pages', pageIndex, 'data', 'numRows'],
            newReduction.getIn(['pages', pageIndex, 'data', 'numRows']) + 1
        );

    // recalculate overview data
    if (reduction.getIn(['pagesLoaded', overviewKey])) {
        const costItem = fields.find(thisItem => thisItem.get('item') === 'cost');
        const dateItem = fields.find(thisItem => thisItem.get('item') === 'date');
        if (typeof costItem === 'undefined' || typeof dateItem === 'undefined') {
            return rErrorMessageOpen(newReduction, map({
                level: ERROR_LEVEL_WARN,
                text: ERROR_MSG_BUG_INVALID_ITEM
            }));
        }
        newReduction = rCalculateOverview(
            newReduction,
            pageIndex,
            dateItem.get('value'),
            dateItem.get('value'),
            costItem.get('value'),
            0
        );
    }

    return newReduction;
}

export function rHandleSuggestions(reduction, { items, reqId }) {
    const newReduction = reduction
        .setIn(['editSuggestions', 'loading'], false)
        .setIn(['editSuggestions', 'active'], -1);

    if (!items || reduction.getIn(['editSuggestions', 'reqId']) !== reqId) {
        // null object (clear), or changed input while suggestions were loading
        return newReduction
            .setIn(['editSuggestions', 'list'], list.of())
            .setIn(['editSuggestions', 'reqId'], null);
    }

    return newReduction.setIn(['editSuggestions', 'list'], items);
}

export function rRequestSuggestions(reduction, { reqId }) {
    return reduction
        .setIn(['editSuggestions', 'loading'], true)
        .setIn(['editSuggestions', 'reqId'], reqId);
}

function getTransactionsForRow(reduction, row, col) {
    const pageIndex = PAGES.indexOf('funds');

    if (row > -1) {
        return reduction.getIn(['pages', pageIndex, 'rows', row, 'cols', col]);
    }

    return reduction.getIn(['edit', 'add', pageIndex, col]);
}

function rFundTransactions(reduction, row, col, transactions) {
    const pageIndex = PAGES.indexOf('funds');

    if (row > -1) {
        const item = map({
            item: 'transactions',
            row,
            col,
            value: transactions
        });

        return applyEditsList(reduction, item, pageIndex)
            .setIn(
                ['edit', 'active'],
                reduction.getIn(['edit', 'active']).set('value', transactions)
            );
    }

    return reduction.setIn(
        ['edit', 'add', pageIndex, col], transactions
    );
}

export function rChangeFundTransactions(reduction, item) {
    const transactions = getTransactionsForRow(reduction, item.row, item.col)
        .setIn([item.key, item.column], item.value);

    return rFundTransactions(reduction, item.row, item.col, transactions);
}

export function rAddFundTransactions(reduction, item) {
    const transactions = getTransactionsForRow(reduction, item.row, item.col)
        .push(item);

    return rFundTransactions(reduction, item.row, item.col, transactions);
}

export function rRemoveFundTransactions(reduction, item) {
    const transactions = getTransactionsForRow(reduction, item.row, item.col)
        .remove(item.key);

    return rFundTransactions(reduction, item.row, item.col, transactions);
}

