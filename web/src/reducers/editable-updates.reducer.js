import { Map as map } from 'immutable';

import { PAGES } from '../misc/const';
import { sortRowsByDate, addWeeklyAverages } from '../misc/data';

import { pushToRequestQueue } from './request-queue.reducer';
import { rGetOverviewRows, rProcessDataOverview, rCalculateOverview } from './overview.reducer';
import { getExtraRowProps as reloadFundsRows } from './funds.reducer';

export function resortListRows(reduction, { page }) {
    // sort rows by date
    const sortedRows = sortRowsByDate(reduction.getIn(['pages', page, 'rows']), page);
    const weeklyData = addWeeklyAverages(reduction.getIn(['pages', page, 'data']), sortedRows, page);

    return reduction
        .setIn(['pages', page, 'rows'], sortedRows)
        .setIn(['pages', page, 'data'], weeklyData);
}

export function recalculateFundProfits(reduction) {
    const rows = reduction.getIn(['pages', 'funds', 'rows']);
    const startTime = reduction.getIn(['pages', 'funds', 'startTime']);
    const cacheTimes = reduction.getIn(['pages', 'funds', 'cacheTimes']);

    const rowsWithExtraProps = reloadFundsRows(rows, startTime, cacheTimes);

    return reduction
        .setIn(['pages', 'funds', 'rows'], rowsWithExtraProps);
}

export function applyEditsOverview(reduction, { item }) {
    // update the balance for a row and recalculate overview data
    const value = item.get('value');
    const row = item.get('row');

    const newCost = reduction
        .getIn(['pages', 'overview', 'data', 'costActual'])
        .setIn(['balance', row], value);

    const startYearMonth = reduction.getIn(['pages', 'overview', 'data', 'startYearMonth']);
    const endYearMonth = reduction.getIn(['pages', 'overview', 'data', 'endYearMonth']);
    const currentYearMonth = reduction.getIn(['pages', 'overview', 'data', 'currentYearMonth']);
    const futureMonths = reduction.getIn(['pages', 'overview', 'data', 'futureMonths']);

    const newData = rProcessDataOverview(
        newCost, startYearMonth, endYearMonth, currentYearMonth, futureMonths);

    return reduction
        .setIn(['pages', 'overview', 'data'], newData)
        .setIn(['pages', 'overview', 'data', 'targets'],
            reduction.getIn(['pages', 'overview', 'data', 'targets'])
        )
        .setIn(['pages', 'overview', 'rows'], rGetOverviewRows(newData));
}

export function applyEditsList(reduction, { item, page }) {
    // update list data in the UI
    if (item.get('row') === -1) {
        // add-item
        return reduction.setIn(['edit', 'add', page, item.get('col')], item.get('value'));
    }

    let newReduction = reduction;

    // update row
    newReduction = newReduction.setIn(
        ['pages', page, 'rows', item.get('row'), 'cols', item.get('col')],
        item.get('value')
    );

    // recalculate total if the cost has changed
    if (item.get('item') === 'cost') {
        newReduction = newReduction.setIn(
            ['pages', page, 'data', 'total'],
            newReduction.getIn(['pages', page, 'data', 'total']) +
                item.get('value') - item.get('originalValue')
        );
    }

    // recalculate fund profits / losses if transactions have changed
    if (page === 'funds' && item.get('item') === 'transactions') {
        newReduction = recalculateFundProfits(newReduction);
    }

    newReduction = resortListRows(newReduction, { page });

    // recalculate overview data if the cost or date changed
    if (reduction.getIn(['pagesLoaded', 'overview'])) {
        if (item.get('item') === 'cost') {
            const dateKey = PAGES[page].cols.indexOf('date');
            const date = newReduction.getIn(
                ['pages', page, 'rows', item.get('row'), 'cols', dateKey]
            );

            newReduction = rCalculateOverview(newReduction, {
                page,
                newDate: date,
                oldDate: date,
                newItemCost: item.get('value'),
                oldItemCost: item.get('originalValue')
            });
        }
        else if (item.get('item') === 'date') {
            const costKey = PAGES[page].cols.indexOf('cost');
            const cost = newReduction.getIn(
                ['pages', page, 'rows', item.get('row'), 'cols', costKey]
            );

            newReduction = rCalculateOverview(newReduction, {
                page,
                newDate: item.get('value'),
                oldDate: item.get('originalValue'),
                newItemCost: cost,
                oldItemCost: cost
            });
        }
    }

    return newReduction;
}

export function applyEdits(reduction, { item, page }) {
    if (page === 'overview') {
        return applyEditsOverview(reduction, { item });
    }
    if (PAGES[page].list) {
        return applyEditsList(reduction, { item, page });
    }

    return reduction;
}

export function rDeleteListItem(reduction, { page, id }) {
    let newReduction = reduction;

    const dateKey = PAGES[page].cols.indexOf('date');
    const costKey = PAGES[page].cols.indexOf('cost');
    const itemCost = reduction.getIn(['pages', page, 'rows', id, 'cols', costKey]);

    // recalculate total
    newReduction = newReduction.setIn(
        ['pages', page, 'data', 'total'],
        newReduction.getIn(['pages', page, 'data', 'total']) - itemCost
    );
    // sort rows and recalculate weekly data
    const sortedRows = sortRowsByDate(
        newReduction
            .getIn(['pages', page, 'rows'])
            .delete(id),
        page
    );
    const weeklyData = addWeeklyAverages(
        newReduction.getIn(['pages', page, 'data']),
        sortedRows,
        page
    );

    // recalculate overview data
    if (reduction.getIn(['pagesLoaded', 'overview'])) {
        const date = reduction.getIn(['pages', page, 'rows', id, 'cols', dateKey]);
        newReduction = rCalculateOverview(newReduction, {
            page,
            newDate: date,
            oldDate: date,
            newItemCost: 0,
            oldItemCost: itemCost
        });
    }

    newReduction = pushToRequestQueue(newReduction, map({ page, id, delete: true }))
        .setIn(['pages', page, 'rows'], sortedRows)
        .setIn(['pages', page, 'data'], weeklyData);

    // recalculate fund profits / losses
    if (page === 'funds') {
        newReduction = recalculateFundProfits(newReduction);
    }

    return newReduction;
}

