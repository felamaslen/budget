import { Map as map } from 'immutable';
import { PAGES } from '../constants/data';
import { dataEquals, sortRowsByDate, addWeeklyAverages } from '../helpers/data';

import { pushToRequestQueue } from './request-queue.reducer';
import { rGetOverviewRows, rProcessDataOverview, rCalculateOverview } from './overview.reducer';

export function resortListRows(state, { page }) {
    // sort rows by date
    const sortedRows = sortRowsByDate(state.getIn(['pages', page, 'rows']), page);
    const weeklyData = addWeeklyAverages(state.getIn(['pages', page, 'data']), sortedRows, page);

    return state.setIn(['pages', page, 'rows'], sortedRows)
        .setIn(['pages', page, 'data'], weeklyData);
}

export function applyEditsOverview(state, { item }) {
    // update the balance for a row and recalculate overview data
    const value = item.get('value');
    const row = item.get('row');

    const newCost = state
        .getIn(['pages', 'overview', 'data', 'costActual'])
        .setIn(['balance', row], value);

    const startDate = state.getIn(['pages', 'overview', 'data', 'startDate']);
    const endDate = state.getIn(['pages', 'overview', 'data', 'endDate']);
    const currentDate = state.getIn(['pages', 'overview', 'data', 'currentDate']);
    const futureMonths = state.getIn(['pages', 'overview', 'data', 'futureMonths']);

    const newData = rProcessDataOverview({ costMap: newCost, startDate, endDate, currentDate, futureMonths });

    return state
        .setIn(['pages', 'overview', 'data'], newData)
        .setIn(['pages', 'overview', 'rows'], rGetOverviewRows(newData));
}

function updateRow(state, page, item) {
    const row = item.get('row');
    const col = item.get('col');

    const oldValue = state.getIn(['pages', page, 'rows', row, 'cols', col]);
    const newValue = item.get('value');

    if (dataEquals(oldValue, newValue)) {
        return state;
    }

    return state.setIn(['pages', page, 'rows', row, 'cols', col], newValue);
}

export function applyEditsList(state, { item, page }) {
    // update list data in the UI
    if (item.get('row') === -1) {
        // add-item
        return state.setIn(['edit', 'add', page, item.get('col')], item.get('value'));
    }

    let nextState = updateRow(state, page, item);

    if (item.get('item') === 'cost') {
        const newTotal = nextState.getIn(['pages', page, 'data', 'total']) +
            item.get('value') - item.get('originalValue');

        nextState = nextState.setIn(['pages', page, 'data', 'total'], newTotal);
    }
    else if (item.get('item') === 'date') {
        nextState = resortListRows(nextState, { page });
    }

    // recalculate overview data if the cost or date changed
    if (state.get('pages').has('overview')) {
        if (item.get('item') === 'cost') {
            const dateKey = PAGES[page].cols.indexOf('date');
            const date = nextState.getIn(['pages', page, 'rows', item.get('row'), 'cols', dateKey]);

            nextState = rCalculateOverview(nextState, {
                page,
                newDate: date,
                oldDate: date,
                newItemCost: item.get('value'),
                oldItemCost: item.get('originalValue')
            });
        }
        else if (item.get('item') === 'date') {
            const costKey = PAGES[page].cols.indexOf('cost');
            const cost = nextState.getIn(
                ['pages', page, 'rows', item.get('row'), 'cols', costKey]
            );

            nextState = rCalculateOverview(nextState, {
                page,
                newDate: item.get('value'),
                oldDate: item.get('originalValue'),
                newItemCost: cost,
                oldItemCost: cost
            });
        }
    }

    return nextState;
}

export function applyEdits(state, { item, page }) {
    if (page === 'overview') {
        return applyEditsOverview(state, { item });
    }
    if (PAGES[page].list) {
        return applyEditsList(state, { item, page });
    }

    return state;
}

export function rDeleteListItem(state, { page, id }) {
    let nextState = state;

    const dateKey = PAGES[page].cols.indexOf('date');
    const costKey = PAGES[page].cols.indexOf('cost');
    const itemCost = state.getIn(['pages', page, 'rows', id, 'cols', costKey]);

    // recalculate total
    nextState = nextState.setIn(
        ['pages', page, 'data', 'total'],
        nextState.getIn(['pages', page, 'data', 'total']) - itemCost
    );
    // sort rows and recalculate weekly data
    const { sortedRows, rowIds } = sortRowsByDate(
        nextState
            .getIn(['pages', page, 'rows'])
            .delete(id),
        page);

    const weeklyData = addWeeklyAverages(
        nextState.getIn(['pages', page, 'data']),
        sortedRows,
        page
    );

    // recalculate overview data
    if (state.getIn(['pagesLoaded', 'overview'])) {
        const date = state.getIn(['pages', page, 'rows', id, 'cols', dateKey]);
        nextState = rCalculateOverview(nextState, {
            page,
            newDate: date,
            oldDate: date,
            newItemCost: 0,
            oldItemCost: itemCost
        });
    }

    return pushToRequestQueue(nextState, map({ page, id, delete: true }))
        .setIn(['pages', page, 'rows'], sortedRows)
        .setIn(['pages', page, 'rowIds'], rowIds)
        .setIn(['pages', page, 'data'], weeklyData);
}

