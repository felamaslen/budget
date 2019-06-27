import { createSelector } from 'reselect';
import { PAGES } from '~client/constants/data';
import { getFundsCost } from '~client/selectors/funds';

export const getAllPageRows = (state, { page }) => state.pages[page].rows;

const getPageProp = (state, { page }) => page;

export const getDailyTotals = createSelector([getPageProp, getAllPageRows], (page, rows) => {
    if (!(rows && PAGES[page].daily)) {
        return null;
    }

    const dateKey = PAGES[page].cols.indexOf('date');
    const costKey = PAGES[page].cols.indexOf('cost');

    const [totals] = rows.reduce(([results, dailySum], row, index) => {
        const lastInDay = !(index < rows.length - 1 && row.cols[dateKey].hasSame(rows[index + 1].cols[dateKey], 'day'));
        const cost = row.cols[costKey];

        if (lastInDay) {
            return [{ ...results, [row.id]: dailySum + cost }, 0];
        }

        return [results, dailySum + cost];
    }, [{}, 0]);

    return totals;
});

export const getWeeklyAverages = createSelector([getPageProp, getAllPageRows], (page, rows) => {
    if (!(rows && PAGES[page].daily)) {
        return null;
    }

    const costKey = PAGES[page].cols.indexOf('cost');
    const dateKey = PAGES[page].cols.indexOf('date');

    // note that this is calculated only based on the visible data,
    // not past data

    const visibleTotal = rows.reduce((sum, item) => sum + item.cols[costKey], 0);
    if (!rows.length) {
        return 0;
    }

    const firstDate = rows[0].cols[dateKey];
    const lastDate = rows[rows.length - 1].cols[dateKey];

    const numWeeks = firstDate.diff(lastDate).as('days') / 7;
    if (!numWeeks) {
        return 0;
    }

    return Math.round(visibleTotal / numWeeks);
});

const getListPageData = (state, { page }) => state.pages[page].data && state.pages[page].data.total;

export const getTotalCost = createSelector([
    getPageProp,
    getListPageData,
    getFundsCost
], (page, total, fundsTotal) => {
    if (page === 'funds') {
        return fundsTotal;
    }

    return total;
});
