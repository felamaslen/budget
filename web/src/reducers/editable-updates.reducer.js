import { Map as map } from 'immutable';
import { compose } from 'redux';
import { PAGES } from '../constants/data';
import { dataEquals, sortRowsByDate, addWeeklyAverages } from '../helpers/data';
import { getLoadedStatus } from '../selectors/app';
import { pushToRequestQueue } from './request-queue.reducer';
import { rCalculateOverview } from './overview.reducer';

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

    return state.setIn(['pages', 'overview', 'rows', row, 0], value);
}

function updateRow(item, page) {
    return state => {
        const row = item.get('row');
        const col = item.get('col');

        const oldValue = state.getIn(['pages', page, 'rows', row, 'cols', col]);
        const newValue = item.get('value');

        if (dataEquals(oldValue, newValue)) {
            return state;
        }

        return state.setIn(['pages', page, 'rows', row, 'cols', col], newValue);
    };
}

function calculateOverviewUpdate(item, page) {
    return state => {
        if (!state.get('pages').has('overview')) {
            return state;
        }
        if (item.get('item') === 'cost') {
            const dateKey = PAGES[page].cols.indexOf('date');

            const date = state.getIn(['pages', page, 'rows', item.get('row'), 'cols', dateKey]);

            return rCalculateOverview(state, {
                page,
                newDate: date,
                oldDate: date,
                newItemCost: item.get('value'),
                oldItemCost: item.get('originalValue')
            });
        }
        if (item.get('item') === 'date') {
            const costKey = PAGES[page].cols.indexOf('cost');

            const cost = state.getIn(['pages', page, 'rows', item.get('row'), 'cols', costKey]);

            return rCalculateOverview(state, {
                page,
                newDate: item.get('value'),
                oldDate: item.get('originalValue'),
                newItemCost: cost,
                oldItemCost: cost
            });
        }

        return state;
    };
}

function getNextEditedState(item, page) {
    return state => {
        if (item.get('item') === 'cost') {
            const newTotal = state.getIn(['pages', page, 'data', 'total']) +
                item.get('value') - item.get('originalValue');

            return state.setIn(['pages', page, 'data', 'total'], newTotal);
        }
        if (item.get('item') === 'date') {
            return resortListRows(state, { page });
        }

        return state;
    };
}

export function applyEditsList(state, { item, page }) {
    if (item.get('row') === -1) {
        // add-item
        return state.setIn(['edit', 'add', page, item.get('col')], item.get('value'));
    }

    return compose(
        calculateOverviewUpdate(item, page),
        getNextEditedState(item, page),
        updateRow(item, page)
    )(state);
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
    if (getLoadedStatus(state, { page: 'overview' })) {
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

