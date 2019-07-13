import { createSelector } from 'reselect';
import compose from 'just-compose';

import { CREATE, UPDATE, DELETE, PAGES, PAGES_LIST } from '~client/constants/data';
import { getFundsCost } from '~client/selectors/funds';
import { getValueForTransmit } from '~client/modules/data';

const getNonFilteredItems = (state, { page }) => state[page].items;

export const getAllPageRows = createSelector(getNonFilteredItems, items => items && items
    .filter(({ __optimistic }) => __optimistic !== DELETE)
);

export const getSortedPageRows = createSelector(getAllPageRows, items => items && items
    .slice()
    .sort(({ date: dateA }, { date: dateB }) => dateB - dateA));

const getAllNonFilteredItems = state => PAGES_LIST.map(page => ({
    page,
    items: getNonFilteredItems(state, { page })
}));

const getPageProp = (state, { page }) => page;

export const getDailyTotals = createSelector(getPageProp, getSortedPageRows, (page, rows) => {
    if (!(rows && PAGES[page].daily)) {
        return null;
    }

    const [totals] = rows.reduce(([results, dailySum], { id, date, cost }, index) => {
        const lastInDay = !(index < rows.length - 1 && date.hasSame(rows[index + 1].date, 'day'));
        if (lastInDay) {
            return [{ ...results, [id]: dailySum + cost }, 0];
        }

        return [results, dailySum + cost];
    }, [{}, 0]);

    return totals;
});

export const getWeeklyAverages = createSelector([getPageProp, getSortedPageRows], (page, rows) => {
    if (!(rows && PAGES[page].daily)) {
        return null;
    }

    // note that this is calculated only based on the visible data,
    // not past data

    const visibleTotal = rows.reduce((sum, { cost }) => sum + cost, 0);
    if (!rows.length) {
        return 0;
    }

    const firstDate = rows[0].date;
    const lastDate = rows[rows.length - 1].date;

    const numWeeks = firstDate.diff(lastDate).as('days') / 7;
    if (!numWeeks) {
        return 0;
    }

    return Math.round(visibleTotal / numWeeks);
});

const getListPageData = (state, { page }) => state[page].data && state[page].data.total;

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

const withTransmitValues = requests => requests.map(({ body, ...rest }) => ({
    ...rest,
    body: Object.keys(body).reduce((last, column) => ({
        ...last,
        [column]: getValueForTransmit(column, body[column])
    }), {})
}));

const withCreateRequests = (page, rows) => last => last.concat(rows
    .filter(({ __optimistic }) => __optimistic === CREATE)
    .map(({ id, __optimistic: type, ...body }) => ({
        type,
        fakeId: id,
        method: 'post',
        route: page,
        query: {},
        body
    }))
);

const withUpdateRequests = (page, rows) => last => last.concat(rows
    .filter(({ __optimistic }) => __optimistic === UPDATE)
    .map(({ __optimistic: type, ...body }) => ({
        type,
        id: body.id,
        method: 'put',
        route: page,
        query: {},
        body
    }))
);

const withDeleteRequests = (page, rows) => last => last.concat(rows
    .filter(({ __optimistic }) => __optimistic === DELETE)
    .map(({ id }) => ({
        type: DELETE,
        id,
        method: 'delete',
        route: page,
        query: {},
        body: { id }
    }))
);

const getCrudRequestsByPage = (page, items) => compose(
    withCreateRequests(page, items),
    withUpdateRequests(page, items),
    withDeleteRequests(page, items),
    withTransmitValues
)([]);

export const getCrudRequests = createSelector(getAllNonFilteredItems, itemsByPage =>
    itemsByPage.reduce((last, { page, items }) => last.concat(getCrudRequestsByPage(page, items)), []));
