import { createSelector } from 'reselect';
import compose from 'just-compose';

import { CREATE, UPDATE, DELETE, PAGES, PAGES_LIST } from '~client/constants/data';
import { getCurrentDate } from '~client/selectors/now';
import { getFundsCost } from '~client/selectors/funds';
import { getValueForTransmit } from '~client/modules/data';

const getPageProp = (state, { page }) => page;

const getNonFilteredItems = (state, { page }) => state[page].items;

export const getAllPageRows = createSelector(getNonFilteredItems, items => items && items
    .filter(({ __optimistic }) => __optimistic !== DELETE)
);

const makeGetDaily = items => (last, item, index) => {
    const sum = last + item.cost;
    if ((index < items.length - 1 && !item.date.hasSame(items[index + 1].date, 'day')) ||
        index === items.length - 1
    ) {
        return { daily: sum, dailySum: 0 };
    }

    return { daily: null, dailySum: sum };
};

function makeMemoisedRowProcessor() {
    const resultsCache = {};
    const perPageCache = {};

    return (page, now, items) => {
        if (!items) {
            return [];
        }
        if (perPageCache[page] &&
            now === perPageCache[page].now &&
            items.length === perPageCache[page].items.length &&
            items.every((item, index) => item === perPageCache[page].items[index])
        ) {
            return perPageCache[page].result;
        }

        const sortedByDate = items.slice()
            .sort(({ date: dateA }, { date: dateB }) => dateB - dateA);

        const getDaily = makeGetDaily(sortedByDate);

        const [result] = sortedByDate.reduce(([last, wasFuture, lastDailySum], { __optimistic, ...item }, index) => {
            const future = wasFuture && item.date > now;
            const firstPresent = wasFuture && !future;
            const { daily, dailySum } = getDaily(lastDailySum, item, index);

            const extraProps = { future, firstPresent, daily };

            const processedItem = { ...item, ...extraProps };
            const cachedItem = resultsCache[item.id];

            if (cachedItem && Object.keys(processedItem).every(key => processedItem[key] === cachedItem[key])) {
                return [last.concat([cachedItem]), future, dailySum];
            }

            resultsCache[item.id] = processedItem;

            return [last.concat([processedItem]), future, dailySum];
        }, [[], true, 0]);

        perPageCache[page] = { result, now, items };

        return result;
    };
}

const memoisedRowProcessor = makeMemoisedRowProcessor();

export const getSortedPageRows = createSelector(
    getPageProp,
    getCurrentDate,
    getAllPageRows,
    (page, now, items) => memoisedRowProcessor(page, now, items)
);

const getAllNonFilteredItems = state => PAGES_LIST.map(page => ({
    page,
    items: getNonFilteredItems(state, { page })
}));

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

const getAllTimeTotal = (state, { page }) => state[page].total || 0;

export const getTotalCost = createSelector([
    getPageProp,
    getAllTimeTotal,
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
