import memoize from 'fast-memoize';
import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { COLOR_FUND_UP, COLOR_FUND_DOWN } from '~client/constants/colors';

function getFundColor(value, min, max) {
    const color = value > 0
        ? COLOR_FUND_UP
        : COLOR_FUND_DOWN;

    const range = value > 0
        ? max
        : min;

    if (value === 0 || Math.abs(range) === 0) {
        return [255, 255, 255];
    }

    return color.map(channel =>
        Math.round(255 + (value / range) * (channel - 255)));
}

const roundGain = value => Math.round(10000 * value) / 10000;
const roundAbs = value => Math.round(value);

function getCostValue(transactions, price, yesterdayPrice) {
    if (isSold(transactions)) {
        return transactions.reduce(({ cost, value }, item) => ({
            cost: cost + Math.max(0, item.cost),
            value: value - Math.min(0, item.cost)
        }), { cost: 0, value: 0 });
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

    return { cost, value, dayGain, dayGainAbs };
}

export function getRowGains(rows, cache) {
    return rows.reduce((items, { id, transactions }) => {
        const rowCache = cache.prices[id];
        if (!(rowCache && rowCache.values.length)) {
            return { ...items, [id]: {} };
        }

        const price = rowCache.values[rowCache.values.length - 1];
        const yesterdayPrice = rowCache.values.length > 1
            ? rowCache.values[rowCache.values.length - 2]
            : null;

        const { cost, ...props } = getCostValue(transactions, price, yesterdayPrice);

        const gainAbs = roundAbs(props.value - cost);
        const gain = roundGain((props.value - cost) / cost);

        return { ...items, [id]: { ...props, gain, gainAbs } };
    }, {});
}

const getMinMax = memoize(rowGains => Object.keys(rowGains).reduce(([min, max], id) => ([
    Math.min(min, rowGains[id].gain),
    Math.max(max, rowGains[id].gain)
]), [Infinity, -Infinity]));

export function getGainsForRow(rowGains, id) {
    if (!(rowGains[id] && Object.keys(rowGains[id]).length)) {
        return null;
    }

    return { ...rowGains[id], color: getFundColor(rowGains[id].gain, ...getMinMax(rowGains)) };
}
