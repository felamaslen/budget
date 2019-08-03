import { createSelector } from 'reselect';
import compose from 'just-compose';
import { DateTime } from 'luxon';

import { IDENTITY } from '~client/modules/data';

export const getStocks = state => state.stocks.shares;
export const getIndices = state => state.stocks.indices;

const getQuotes = state => state.stocks.quotes;

function withTitle(name, shortName) {
    if (name === shortName) {
        return IDENTITY;
    }

    return last => ({ ...last, title: name });
}

const haveTimeSeries = (quotes, code) => Boolean(quotes[code] &&
    quotes[code].timeSeries &&
    quotes[code].timeSeries.length);

const havePrevClose = (quotes, code) => Boolean(quotes[code] &&
    quotes[code].prevClose);

function withPrice(quotes, code) {
    if (!haveTimeSeries(quotes, code)) {
        return IDENTITY;
    }

    return last => ({ ...last, price: quotes[code].timeSeries[0].close });
}

function getGraph(quotes, code) {
    const values = quotes[code].timeSeries
        .slice()
        .map(({ date, close }) => ({ date: DateTime.fromISO(date).ts / 1000, close }))
        .sort(({ date: dateA }, { date: dateB }) => dateA - dateB);

    return values.map(({ date, close }) => ([
        date - values[0].date,
        100 * (close - quotes[code].prevClose) / quotes[code].prevClose
    ]));
}

function withGraph(quotes, code) {
    if (!(haveTimeSeries(quotes, code) && havePrevClose(quotes, code))) {
        return IDENTITY;
    }

    return last => {
        const lastGainPercent = quotes[code].timeSeries.length > 1
            ? 100 * (last.price - quotes[code].timeSeries[1].close) / quotes[code].timeSeries[1].close
            : null;

        return {
            ...last,
            gainPercent: 100 * (last.price - quotes[code].prevClose) / quotes[code].prevClose,
            lastGainPercent,
            graph: getGraph(quotes, code)
        };
    };
}

const processStockListItem = quotes => ({ code, name, shortName }) => compose(
    withTitle(name, shortName),
    withPrice(quotes, code),
    withGraph(quotes, code)
)({
    name: shortName
});

const processStocksList = (shares, indices, quotes) => ([
    ...shares.map(({ code, ...rest }) => ({ code, shortName: code, ...rest })),
    ...indices.map(({ name, ...rest }) => ({ name, shortName: name, ...rest }))
]).map(processStockListItem(quotes));

export const getStocksList = createSelector(getStocks, getIndices, getQuotes, processStocksList);
