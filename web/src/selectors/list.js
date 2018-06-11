import { Map as map } from 'immutable';
import { createSelector } from 'reselect';
import { PAGES } from '../constants/data';

export const getPageRow = (state, { page, id, row }) =>
    row || state.getIn(['pages', page, 'rows', id]);

export const getAllPageRows = (state, { page }) => state.getIn(['pages', page, 'rows']);

export const makeGetRowIds = () => createSelector([getAllPageRows], rows =>
    rows && rows.keySeq().toList());

const getPageProp = (state, { page }) => page;

export const makeGetDailyTotals = () => {
    let lastResult = null;

    return createSelector([getPageProp, getAllPageRows], (page, rows) => {
        if (!(rows && PAGES[page].daily)) {
            return null;
        }

        const dateKey = PAGES[page].cols.indexOf('date');
        const costKey = PAGES[page].cols.indexOf('cost');

        const keys = rows.keys();
        keys.next();

        const result = rows.reduce(({ dailySum, results }, row, id) => {
            const nextKey = keys.next().value;

            const lastInDay = !(nextKey && row.getIn(['cols', dateKey]).hasSame(
                rows.getIn([nextKey, 'cols', dateKey]), 'day'));

            const cost = row.getIn(['cols', costKey]);

            if (lastInDay) {
                return {
                    results: results.set(id, dailySum + cost),
                    dailySum: 0
                };
            }

            return { results, dailySum: dailySum + cost };

        }, { results: map.of(), dailySum: 0 })
            .results;

        if (result && result.equals(lastResult)) {
            return lastResult;
        }

        lastResult = result;

        return result;
    });
};

export const makeGetWeeklyAverages = () => {
    return createSelector([getPageProp, getAllPageRows], (page, rows) => {
        if (!(rows && PAGES[page].daily)) {
            return null;
        }

        const costKey = PAGES[page].cols.indexOf('cost');
        const dateKey = PAGES[page].cols.indexOf('date');

        // note that this is calculated only based on the visible data,
        // not past data

        const visibleTotal = rows.reduce((sum, item) =>
            sum + item.getIn(['cols', costKey]), 0);

        if (!rows.size) {
            return 0;
        }

        const firstDate = rows.first().getIn(['cols', dateKey]);
        const lastDate = rows.last().getIn(['cols', dateKey]);

        const numWeeks = firstDate.diff(lastDate).as('days') / 7;
        if (!numWeeks) {
            return 0;
        }

        return Math.round(visibleTotal / numWeeks);
    });
};

