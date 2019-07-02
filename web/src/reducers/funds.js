import makeListReducer, { onRead } from '~client/reducers/list';
import { DATA_READ } from '~client/constants/actions/api';
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
    priceCache: {
        [initialPeriod]: {
            startTime: 0,
            cacheTimes: [],
            prices: []
        }
    }
};

const onReadRows = onRead('funds');

function onReadFunds(state, action) {
    if (!action.res.funds) {
        return {};
    }

    const { res: { funds: { data, startTime, cacheTimes } } } = action;

    const prices = data.map(({ [DATA_KEY_ABBR.id]: id, pr, prStartIndex }) => ({
        id,
        startIndex: prStartIndex,
        values: pr
    }));

    return {
        priceCache: {
            ...state.priceCache,
            [state.period]: {
                startTime,
                cacheTimes,
                prices
            }
        },
        ...onReadRows(state, action)
    };
}

const handlers = {
    [DATA_READ]: onReadFunds
};

export default makeListReducer('funds', handlers, initialState);
