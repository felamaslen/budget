import { Map as map } from 'immutable';

import { PAGES, LIST_COLS_PAGES, LIST_PAGES } from '../misc/const';
import { sortRowsByDate, addWeeklyAverages } from '../misc/data';

import { pushToRequestQueue } from './request-queue.reducer';
import { rGetOverviewRows, rProcessDataOverview, rCalculateOverview } from './overview.reducer';
import { getExtraRowProps as reloadFundsRows } from './funds.reducer';

const overviewKey = PAGES.indexOf('overview');

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

export function recalculateFundProfits(reduction, pageIndex) {
    const rows = reduction.getIn(['pages', pageIndex, 'rows']);
    const startTime = reduction.getIn(['pages', pageIndex, 'startTime']);
    const cacheTimes = reduction.getIn(['pages', pageIndex, 'cacheTimes']);

    const rowsWithExtraProps = reloadFundsRows(rows, startTime, cacheTimes, pageIndex);

    return reduction
        .setIn(['pages', pageIndex, 'rows'], rowsWithExtraProps);
}

export function applyEditsOverview(reduction, item) {
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

export function applyEditsList(reduction, item, pageIndex) {
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

export function applyEdits(reduction, item, pageIndex) {
    if (pageIndex === 0) {
        return applyEditsOverview(reduction, item);
    }
    if (LIST_PAGES.indexOf(pageIndex) > -1) {
        return applyEditsList(reduction, item, pageIndex);
    }

    return reduction;
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

