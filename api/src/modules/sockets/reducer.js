import compose from 'just-compose';
import { DateTime } from 'luxon';

import logger from '~api/modules/logger';
import { replaceAtIndex } from '~api/modules/array';

import {
    CLIENT_DISCONNECTED,
    QUOTE_API_REQUESTED,
    QUOTES_REQUESTED,
    STOCK_RECEIVED,
    CURRENCY_RECEIVED
} from '~api/modules/sockets/actions';

const initialState = {
    stocks: [],
    currencies: []
};

const zones = {
    'US/Eastern': 'America/New_York'
};

const isValid = item => item &&
    Array.isArray(item) &&
    item.every(value => typeof value === 'string');

function withCodes(key, socketId, codes) {
    if (!isValid(codes)) {
        return state => state;
    }

    return state => {
        const uniqueCodes = Array.from(new Set(codes));
        const newCodes = uniqueCodes.filter(code => !state[key].some(
            ({ code: compare }) => compare === code));

        const updatedCodes = uniqueCodes.filter(code => !newCodes.includes(code));

        const updatedItems = state[key]
            .map(item => {
                if (updatedCodes.includes(item.code)) {
                    return {
                        ...item,
                        socketIds: Array.from(new Set([...item.socketIds, socketId]))
                    };
                }

                return item;
            })
            .concat(newCodes.map(code => ({
                code,
                socketIds: [socketId],
                data: [],
                lastRequestTime: null,
                loading: false
            })));

        return { ...state, [key]: updatedItems };
    };
}

const onQuotesRequest = (state, { socketId, stocks, currencies }) => compose(
    withCodes('stocks', socketId, stocks),
    withCodes('currencies', socketId, currencies)
)(state);

const removeDisconnected = (key, socketId) => state => ({
    ...state,
    [key]: state[key].map(({ socketIds, ...rest }) => ({
        socketIds: socketIds.filter(id => id !== socketId),
        ...rest
    }))
});

const onClientDisconnected = (state, { socketId }) => compose(
    removeDisconnected('stocks', socketId),
    removeDisconnected('currencies', socketId)
)(state);

const onApiRequest = (state, { key, code }) => ({
    ...state,
    [key]: replaceAtIndex(
        state[key],
        state[key].findIndex(({ code: compare }) => compare === code),
        value => ({
            ...value,
            lastRequestTime: Date.now(),
            loading: true
        }),
        true
    )
});

const timeSeriesItemKeys = {
    '1. open': 'open',
    '2. high': 'high',
    '3. low': 'low',
    '4. close': 'close',
    '5. volume': 'volume'
};

const processTimeSeriesItem = item => Object.keys(timeSeriesItemKeys)
    .filter(key => key in item)
    .reduce((last, key) => ({
        ...last,
        [timeSeriesItemKeys[key]]: Number(item[key])
    }), {});

const onPricesReceived = (key, timeSeriesKey, code, res, quote = null) => state => {
    try {
        const zone = zones[res.data['Meta Data']['6. Time Zone']] || 'UTC';

        const timeSeriesData = res.data[timeSeriesKey];

        const timeSeries = Object.keys(timeSeriesData)
            .map(date => ({
                date: DateTime.fromSQL(date, { zone })
                    .toUTC()
                    .toISO(),
                ...processTimeSeriesItem(timeSeriesData[date])
            }));

        const data = { timeSeries };

        if (quote) {
            data.prevClose = Number(quote.data['Global Quote']['08. previous close']);
        }

        return {
            ...state,
            [key]: replaceAtIndex(
                state[key],
                state[key].findIndex(({ code: compare }) => compare === code),
                value => ({
                    ...value,
                    data,
                    loading: false
                }),
                true
            )
        };
    } catch (err) {
        logger.warn('Invalid stock prices response:', err.stack);

        return state;
    }
};

const onStockReceived = (state, { code, quote, timeseries }) => compose(
    onPricesReceived('stocks', 'Time Series (1min)', code, timeseries, quote)
)(state);

const onCurrencyReceived = (state, { code, res }) => compose(
    onPricesReceived('currencies', 'Time Series FX (1min)', code, res)
)(state);

export default function socketReducer(state = initialState, { type, ...action }) {
    if (type === QUOTES_REQUESTED) {
        return onQuotesRequest(state, action);
    }
    if (type === CLIENT_DISCONNECTED) {
        return onClientDisconnected(state, action);
    }
    if (type === QUOTE_API_REQUESTED) {
        return onApiRequest(state, action);
    }
    if (type === STOCK_RECEIVED) {
        return onStockReceived(state, action);
    }
    if (type === CURRENCY_RECEIVED) {
        return onCurrencyReceived(state, action);
    }

    return state;
}
