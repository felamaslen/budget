import makeListReducer, { onRead } from '~client/reducers/list';
import { DATA_READ } from '~client/constants/actions/api';
import { FUNDS_RECEIVED } from '~client/constants/actions/funds';
import { DATA_KEY_ABBR } from '~client/constants/data';
import { GRAPH_FUNDS_PERIODS } from '~client/constants/graph';

function getDefaultFundPeriod() {
    if (process.env.DEFAULT_FUND_PERIOD && GRAPH_FUNDS_PERIODS
        .map(([shortPeriod]) => shortPeriod)
        .includes(process.env.DEFAULT_FUND_PERIOD)
    ) {
        return process.env.DEFAULT_FUND_PERIOD;
    }

    return GRAPH_FUNDS_PERIODS[0][0];
}

const initialPeriod = getDefaultFundPeriod();

export const initialState = {
    viewSoldFunds: false,
    items: [],
    period: initialPeriod,
    cache: {
        [initialPeriod]: {
            startTime: 0,
            cacheTimes: [],
            prices: []
        }
    }
};

const onReadRows = onRead('funds');

function getPriceCache(funds) {
    const { data, startTime, cacheTimes } = funds;

    const prices = data.map(({ [DATA_KEY_ABBR.id]: id, pr, prStartIndex }) => ({
        id,
        startIndex: prStartIndex,
        values: pr
    }));

    return {
        startTime,
        cacheTimes,
        prices
    };
}

function onReadFunds(state, action) {
    if (!action.res.funds) {
        return {};
    }

    return {
        cache: {
            ...state.cache,
            [state.period]: getPriceCache(action.res.funds)
        },
        ...onReadRows(state, action)
    };
}

function onPeriodLoad(state, { res, period }) {
    if (!res) {
        return { period };
    }

    return {
        period,
        cache: {
            ...state.cache,
            [period]: getPriceCache(res.data)
        }
    };
}

const handlers = {
    [DATA_READ]: onReadFunds,
    [FUNDS_RECEIVED]: onPeriodLoad
};

export default makeListReducer('funds', handlers, initialState);
