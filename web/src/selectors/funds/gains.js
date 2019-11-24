import { createSelector } from 'reselect';
import memoize from 'memoize-one';
import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { COLOR_FUND_UP, COLOR_FUND_DOWN } from '~client/constants/colors';
import { getCurrentFundsCache, getFundsRows } from '~client/selectors/funds/helpers';

function getFundColor(value, min, max) {
    const color = value > 0 ? COLOR_FUND_UP : COLOR_FUND_DOWN;

    const range = value > 0 ? max : min;

    if (value === 0 || Math.abs(range) === 0) {
        return [255, 255, 255];
    }

    return color.map(channel => Math.round(255 + (value / range) * (channel - 255)));
}

const roundGain = value => Math.round(10000 * value) / 10000;
const roundAbs = value => Math.round(value);

function getCostValue(transactions, price, yesterdayPrice) {
    if (isSold(transactions) || !price) {
        return transactions.reduce(
            ({ cost, value }, item) => ({
                cost: cost + Math.max(0, item.cost),
                value: value - Math.min(0, item.cost),
            }),
            { cost: 0, value: 0 },
        );
    }

    const units = getTotalUnits(transactions);
    const cost = getTotalCost(transactions);
    const value = price * units;

    let dayGainAbs = 0;
    let dayGain = 0;

    if (yesterdayPrice) {
        dayGainAbs = roundAbs((price - yesterdayPrice) * units);
        dayGain = roundGain((price - yesterdayPrice) / yesterdayPrice);
    }

    return {
        cost,
        value,
        dayGain,
        dayGainAbs,
    };
}

export function getRowGains(rows, cache) {
    return rows.reduce((items, { id, transactions }) => {
        if (!transactions) {
            return { ...items, [id]: { value: 0, gain: 0, gainAbs: 0 } };
        }

        const rowCache = cache.prices[id] || { values: [] };

        const price = rowCache.values.length ? rowCache.values[rowCache.values.length - 1] : 0;

        const yesterdayPrice =
            rowCache.values.length > 1 ? rowCache.values[rowCache.values.length - 2] : 0;

        const { cost, ...props } = getCostValue(transactions, price, yesterdayPrice);

        const gainAbs = roundAbs(props.value - cost);
        const gain = roundGain((props.value - cost) / cost);

        return { ...items, [id]: { ...props, gain, gainAbs } };
    }, {});
}

const getMinMax = memoize(rowGains =>
    Object.keys(rowGains).reduce(
        ([min, max], id) => [Math.min(min, rowGains[id].gain), Math.max(max, rowGains[id].gain)],
        [Infinity, -Infinity],
    ),
);

export function getGainsForRow(rowGains, id) {
    if (!(rowGains[id] && Object.keys(rowGains[id]).length)) {
        return null;
    }

    return { ...rowGains[id], color: getFundColor(rowGains[id].gain, ...getMinMax(rowGains)) };
}

const getItemsWithPrices = createSelector(
    getCurrentFundsCache,
    getFundsRows,
    (cache, items) => {
        if (!(cache && cache.cacheTimes && cache.cacheTimes.length > 1 && items && items.length)) {
            return [];
        }

        return items.filter(({ id, transactions }) => cache.prices[id] && transactions);
    },
);

const getLatestTimes = createSelector(
    getCurrentFundsCache,
    cache => {
        if (!(cache && cache.cacheTimes && cache.cacheTimes.length > 1)) {
            return { timeLatest: new Date(), timePrev: new Date() };
        }

        const { cacheTimes, startTime } = cache;

        const timeLatest = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 1]));
        const timePrev = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 2]));

        return { timeLatest, timePrev };
    },
);

const getLatestValues = createSelector(
    getItemsWithPrices,
    getLatestTimes,
    getCurrentFundsCache,
    (itemsWithPrices, { timeLatest, timePrev }, cache) => {
        const getValue = maxDate => {
            const maxDateValue = maxDate.getTime() / 1000;

            return itemsWithPrices.reduce((last, { id, transactions }) => {
                const { startIndex, values } = cache.prices[id];
                const timeIndex =
                    cache.cacheTimes.length -
                    1 -
                    cache.cacheTimes
                        .slice()
                        .reverse()
                        .findIndex(value => value + cache.startTime <= maxDateValue);

                if (timeIndex >= startIndex + values.length) {
                    return last;
                }

                const price = values[timeIndex - startIndex];

                const units = transactions
                    .filter(({ date }) => date <= maxDate)
                    .reduce((sum, { units: value }) => sum + value, 0);

                return last + price * units;
            }, 0);
        };

        return { latest: getValue(timeLatest), prev: getValue(timePrev) };
    },
);

export const getDayGainAbs = createSelector(
    getLatestValues,
    ({ latest, prev }) => latest - prev,
);

export const getDayGain = createSelector(
    getItemsWithPrices,
    getLatestTimes,
    getLatestValues,
    (itemsWithPrices, { timeLatest, timePrev }, { latest, prev }) => {
        if (!(latest && prev)) {
            return 0;
        }

        const getCost = maxDate =>
            itemsWithPrices.reduce(
                (last, { transactions }) =>
                    transactions
                        .filter(({ date }) => date <= maxDate)
                        .reduce((sum, { cost }) => sum + cost, last),
                0,
            );

        const costLatest = getCost(timeLatest);
        const costPrev = getCost(timePrev);

        const gainLatest = (latest - costLatest) / costLatest;
        const gainPrev = (prev - costPrev) / costPrev;

        const dayGain = (1 + gainLatest) / (1 + gainPrev) - 1;

        return dayGain;
    },
);
