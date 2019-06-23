import { Map as map } from 'immutable';

import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { PAGES } from '~client/constants/data';
import { COLOR_FUND_UP, COLOR_FUND_DOWN } from '~client/constants/colors';

const transactionsKey = PAGES.funds.cols.indexOf('transactions');

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
    return rows.reduce((items, row, id) => {
        const rowCache = cache.getIn(['prices', id]);
        if (!(rowCache && rowCache.get('values').size)) {
            return items;
        }

        const transactions = row.getIn(['cols', transactionsKey]);
        const price = rowCache.get('values').last();
        const yesterdayPrice = rowCache.get('values').size > 1
            ? rowCache.getIn(['values', -2])
            : null;

        const { cost, ...props } = getCostValue(transactions, price, yesterdayPrice);

        const gainAbs = roundAbs(props.value - cost);
        const gain = roundGain((props.value - cost) / cost);

        return items.set(id, map({ ...props, gain, gainAbs }));

    }, map.of());
}

export function getGainsForRow(rowGains, id, min, max) {
    if (!rowGains.get(id)) {
        return null;
    }

    const color = getFundColor(rowGains.getIn([id, 'gain']), min, max);

    return rowGains.get(id).set('color', color);
}
