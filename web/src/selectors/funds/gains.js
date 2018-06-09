import { Map as map } from 'immutable';
import { PAGES } from '../../constants/data';
import { COLOR_FUND_UP, COLOR_FUND_DOWN } from '../../constants/colors';

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

export function getRowGains(rows, cache) {
    return rows.reduce((items, row, id) => {
        const rowCache = cache.getIn(['prices', id]);
        if (!(rowCache && rowCache.get('values').size)) {
            return items;
        }

        const transactions = row.getIn(['cols', transactionsKey]);

        const price = rowCache.get('values').last();
        const units = transactions.getLastUnits();
        const cost = transactions.getLastCost();
        const value = price * units;

        const gainAbs = roundAbs(value - cost);
        const gain = roundGain((value - cost) / cost);

        let dayGainAbs = 0;
        let dayGain = 0;

        if (rowCache.get('values').size > 1) {
            const yesterdayPrice = rowCache.getIn(['values', -2]);

            dayGainAbs = roundAbs((price - yesterdayPrice) * units);
            dayGain = roundGain((price - yesterdayPrice) / yesterdayPrice);
        }

        return items.set(id, map({ value, gain, dayGain, gainAbs, dayGainAbs }));
    }, map.of());
}

export function getGainsForRow(rowGains, id, min, max) {
    if (!rowGains.get(id)) {
        return null;
    }

    const color = getFundColor(rowGains.getIn([id, 'gain']), min, max);

    return rowGains.get(id).set('color', color);
}

