import { Map as map } from 'immutable';
import { compose } from 'redux';
import { PAGES } from '~client/constants/data';
import { IDENTITY, dataEquals, resortListRows } from '~client/modules/data';
import { pushToRequestQueue } from './request-queue.reducer';
import { updateTotal } from './edit.reducer';
import { rCalculateOverview } from './overview.reducer';

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

export function applyEditsList(state, { item, page }) {
    if (item.get('row') === -1) {
        // add-item
        return state.setIn(['edit', 'add', page, item.get('col')], item.get('value'));
    }

    let sortOrTotal = IDENTITY;
    let doOverview = IDENTITY;

    if (item.get('item') === 'cost') {
        const dateKey = PAGES[page].cols.indexOf('date');
        const date = state.getIn(['pages', page, 'rows', item.get('row'), 'cols', dateKey]);

        const newItemCost = item.get('value');
        const oldItemCost = item.get('originalValue');

        doOverview = rCalculateOverview({ page, newDate: date, oldDate: date, newItemCost, oldItemCost });

        const newTotal = state.getIn(['pages', page, 'data', 'total']) + newItemCost - oldItemCost;

        sortOrTotal = updateTotal(page, newTotal);
    }
    else if (item.get('item') === 'date') {
        const costKey = PAGES[page].cols.indexOf('cost');
        const cost = state.getIn(['pages', page, 'rows', item.get('row'), 'cols', costKey]);

        doOverview = rCalculateOverview({ page, newDate: item.get('value'), oldDate: item.get('originalValue'), newItemCost: cost, oldItemCost: cost });

        sortOrTotal = resortListRows(page, state.get('now'));
    }

    return compose(
        sortOrTotal,
        updateRow(item, page),
        doOverview
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

function pushDeleteRequest(page, id) {
    return state => pushToRequestQueue(state, map({ page, id, delete: true }));
}

function deleteItem(page, id) {
    return state => state.deleteIn(['pages', page, 'rows', id]);
}

export function rDeleteListItem(state, { page, id }) {
    const dateKey = PAGES[page].cols.indexOf('date');
    const costKey = PAGES[page].cols.indexOf('cost');

    const oldItemCost = state.getIn(['pages', page, 'rows', id, 'cols', costKey]);

    const newTotal = state.getIn(['pages', page, 'data', 'total']) - oldItemCost;

    const date = state.getIn(['pages', page, 'rows', id, 'cols', dateKey]);

    return compose(
        pushDeleteRequest(page, id),
        resortListRows(page, state.get('now')),
        updateTotal(page, newTotal),
        deleteItem(page, id),
        rCalculateOverview({ page, newDate: date, oldDate: date, newItemCost: 0, oldItemCost }),
    )(state);
}

