/**
 * Carries out actions for the editable framework
 */

import { List as list, Map as map } from 'immutable';

import { rGetOverviewRows, rCalculateOverview, rProcessDataOverview } from './data/overview';
import { getExtraRowProps as reloadFundsRows } from './data/funds';
import {
    PAGES, LIST_PAGES, LIST_COLS_PAGES, ERROR_LEVEL_WARN
} from '../misc/const';
import { ERROR_MSG_BUG_INVALID_ITEM } from '../misc/config';
import { YMD } from '../misc/date';
import {
    getNullEditable, getAddDefaultValues, sortRowsByDate, addWeeklyAverages,
    getValueForTransmit
} from '../misc/data';
import { rErrorMessageOpen } from './ErrorReducer';

export function recalculateFundProfits(reduction, pageIndex) {
    const rows = reduction.getIn(['pages', pageIndex, 'rows']);
    const startTime = reduction.getIn(['pages', pageIndex, 'startTime']);
    const cacheTimes = reduction.getIn(['pages', pageIndex, 'cacheTimes']);

    const rowsWithExtraProps = reloadFundsRows(rows, startTime, cacheTimes, pageIndex);

    return reduction
        .setIn(['pages', pageIndex, 'rows'], rowsWithExtraProps);
}

const overviewKey = PAGES.indexOf('overview');
function applyEditsOverview(reduction, item) {
    // update the balance for a row and recalculate overview data
    const value = item.get('value');
    const row = item.get('row');

    const newCost = reduction
        .getIn(['pages', overviewKey, 'data', 'cost'])
        .setIn(['balance', row], value);

    const startYearMonth = reduction.getIn(['pages', overviewKey, 'data', 'startYearMonth']);
    const endYearMonth = reduction.getIn(['pages', overviewKey, 'data', 'endYearMonth']);
    const currentYearMonth = reduction.getIn(['pages', overviewKey, 'data', 'currentYearMonth']);
    const futureMonths = reduction.getIn(['pages', overviewKey, 'data', 'futureMonths']);

    const newData = rProcessDataOverview(
        newCost, startYearMonth, endYearMonth, currentYearMonth, futureMonths);

    return reduction
        .setIn(['pages', overviewKey, 'data'], newData)
        .setIn(['pages', overviewKey, 'rows'], rGetOverviewRows(newData));
}

export function resortListRows(reduction, pageIndex) {
    // sort rows by date
    const sortedRows = sortRowsByDate(reduction.getIn(
        ['pages', pageIndex, 'rows']), pageIndex
    );
    const weeklyData = addWeeklyAverages(reduction.getIn(
        ['pages', pageIndex, 'data']), sortedRows, pageIndex
    );

    return reduction
        .setIn(['pages', pageIndex, 'rows'], sortedRows)
        .setIn(['pages', pageIndex, 'data'], weeklyData);
}

function applyEditsList(reduction, item, pageIndex) {
    // update list data in the UI
    if (item.get('row') === -1) {
        // add-item
        return reduction.setIn(['edit', 'add', pageIndex, item.get('col')], item.get('value'));
    }

    let newReduction = reduction;

    // update row
    newReduction = newReduction.setIn(
        ['pages', pageIndex, 'rows', item.get('row'), 'cols', item.get('col')],
        item.get('value')
    );

    // recalculate total if the cost has changed
    if (item.get('item') === 'cost') {
        newReduction = newReduction.setIn(
            ['pages', pageIndex, 'data', 'total'],
            newReduction.getIn(['pages', pageIndex, 'data', 'total']) +
                item.get('value') - item.get('originalValue')
        );
    }

    // recalculate fund profits / losses if transactions have changed
    if (PAGES[pageIndex] === 'funds' && item.get('item') === 'transactions') {
        newReduction = recalculateFundProfits(newReduction, pageIndex);
    }

    newReduction = resortListRows(newReduction, pageIndex);

    // recalculate overview data if the cost or date changed
    if (reduction.getIn(['pagesLoaded', overviewKey])) {
        if (item.get('item') === 'cost') {
            const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
            const date = newReduction.getIn(
                ['pages', pageIndex, 'rows', item.get('row'), 'cols', dateKey]
            );

            newReduction = rCalculateOverview(
                newReduction,
                pageIndex,
                date,
                date,
                item.get('value'),
                item.get('originalValue')
            );
        }
        else if (item.get('item') === 'date') {
            const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
            const cost = newReduction.getIn(
                ['pages', pageIndex, 'rows', item.get('row'), 'cols', costKey]
            );

            newReduction = rCalculateOverview(
                newReduction,
                pageIndex,
                item.get('value'),
                item.get('originalValue'),
                cost,
                cost
            );
        }
    }

    return newReduction;
}

/**
 * applyEdits: apply editItem edits to UI (API handled separately)
 * @param {Record} reduction: reduction to modify and return
 * @param {map} item: edit item
 * @param {integer} pageIndex: index of the page on which edits are being done
 * @returns {Record} modified reduction
 */
function applyEdits(reduction, item, pageIndex) {
    if (pageIndex === 0) {
        return applyEditsOverview(reduction, item);
    }
    if (LIST_PAGES.indexOf(pageIndex) > -1) {
        return applyEditsList(reduction, item, pageIndex);
    }

    return reduction;
}

export function addToRequestQueue(requestList, dataItem, startYearMonth = null) {
    const pageIndex = dataItem.get('pageIndex');

    if (dataItem.get('delete')) {
        return requestList.push(map({
            req: map({
                method: 'delete',
                route: PAGES[dataItem.get('pageIndex')],
                query: map.of(),
                body: map({ id: dataItem.get('id') })
            })
        }));
    }

    const item = dataItem.get('item');
    const value = getValueForTransmit(dataItem.get('value'));

    if (PAGES[pageIndex] === 'overview') {
        const key = dataItem.get('row');
        const year = startYearMonth[0] + Math.floor((key + startYearMonth[1] - 1) / 12);
        const month = (startYearMonth[1] + key - 1) % 12 + 1;
        const balance = value;

        return requestList.push(map({
            pageIndex,
            req: map({
                method: 'post',
                route: 'balance',
                query: map.of(),
                body: map({ year, month, balance })
            })
        }));
    }

    if (LIST_PAGES.indexOf(pageIndex) > -1) {
        const id = dataItem.get('id');

        const reqPageIndex = requestList.findIndex(req => {
            return req.get('pageIndex') === pageIndex &&
                req.getIn(['req', 'body', 'id']) === id;
        });

        if (reqPageIndex > -1) {
            return requestList.setIn([reqPageIndex, 'req', 'body', item], value);
        }

        return requestList.push(map({
            pageIndex,
            req: map({
                method: 'put',
                route: PAGES[pageIndex],
                query: map.of(),
                body: map({ id, [item]: value })
            })
        }));
    }

    return requestList;
}

export function pushToRequestQueue(reduction, dataItem) {
    const startYearMonth = reduction.getIn(['pages', PAGES.indexOf('overview'), 'data', 'startYearMonth']);

    const requestList = reduction.getIn(['edit', 'requestList']);
    const newRequestList = addToRequestQueue(requestList, dataItem, startYearMonth || null);

    return reduction
        .setIn(['edit', 'requestList'], newRequestList);
}

export function rActivateEditable(reduction, editable, cancel) {
    const active = reduction.getIn(['edit', 'active']);
    const pageIndex = reduction.getIn(['currentPageIndex']);
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

    // can pass null to deactivate editing
    if (!editable) {
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

export function rDeleteListItem(reduction, { pageIndex, id }) {
    let newReduction = reduction;

    const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
    const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
    const itemCost = reduction.getIn(['pages', pageIndex, 'rows', id, 'cols', costKey]);

    // recalculate total
    newReduction = newReduction.setIn(
        ['pages', pageIndex, 'data', 'total'],
        newReduction.getIn(['pages', pageIndex, 'data', 'total']) - itemCost
    );
    // sort rows and recalculate weekly data
    const sortedRows = sortRowsByDate(
        newReduction
            .getIn(['pages', pageIndex, 'rows'])
            .delete(id),
        pageIndex
    );
    const weeklyData = addWeeklyAverages(
        newReduction.getIn(['pages', pageIndex, 'data']),
        sortedRows,
        pageIndex
    );

    // recalculate overview data
    if (reduction.getIn(['pagesLoaded', overviewKey])) {
        const date = reduction.getIn(
            ['pages', pageIndex, 'rows', id, 'cols', dateKey]
        );
        newReduction = rCalculateOverview(newReduction, pageIndex, date, date, 0, itemCost);
    }

    newReduction = pushToRequestQueue(newReduction, map({
        pageIndex, id, delete: true
    }))
        .setIn(['pages', pageIndex, 'rows'], sortedRows)
        .setIn(['pages', pageIndex, 'data'], weeklyData);

    // recalculate fund profits / losses
    if (PAGES[pageIndex] === 'funds') {
        newReduction = recalculateFundProfits(newReduction, pageIndex);
    }

    return newReduction;
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

export function rAddListItem(reduction, { pageIndex, sending }) {
    if (sending) {
        const now = new YMD();

        return rActivateEditable(reduction, null)
            .setIn(['edit', 'add', pageIndex], getAddDefaultValues(pageIndex))
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

    return reduction;
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

