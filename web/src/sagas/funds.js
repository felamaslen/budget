import {
    debounce, select, takeLatest, call, put,
} from 'redux-saga/effects';
import axios from 'axios';
import querystring from 'querystring';

import { errorOpened } from '~client/actions/error';
import { fundsReceived } from '~client/actions/funds';
import { stocksListReceived, stockPricesReceived } from '~client/actions/stocks';
import { getApiKey } from '~client/selectors/api';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getPeriod } from '~client/selectors/funds';
import { getStocks, getIndices } from '~client/selectors/funds/stocks';
import { getPeriodMatch } from '~client/modules/data';
import { getStockPrices } from '~client/modules/finance';
import { API_PREFIX } from '~client/constants/data';
import { FUNDS_REQUESTED } from '~client/constants/actions/funds';
import { STOCKS_LIST_REQUESTED, STOCKS_PRICES_REQUESTED } from '~client/constants/actions/stocks';
import { DO_STOCKS_LIST } from '~client/constants/stocks';

export function* getFundHistoryQuery(period = null) {
    const nextPeriod = period || (yield select(getPeriod));

    const periodMatch = getPeriodMatch(nextPeriod);

    return { ...periodMatch, history: true };
}

export function* requestFundPeriodData({ period, fromCache }) {
    const nextPeriod = period || (yield select(getPeriod));
    if (fromCache) {
        const cache = yield select(getFundsCache);

        if (cache[nextPeriod]) {
            yield put(fundsReceived(nextPeriod));

            return;
        }
    }

    const query = yield call(getFundHistoryQuery, nextPeriod);
    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/funds?${querystring.stringify(query)}`, {
            headers: {
                Authorization: apiKey,
            },
        });

        yield put(fundsReceived(nextPeriod, res.data));
    } catch (err) {
        yield put(errorOpened('Error loading fund data'));
    }
}

export function* requestStocksList() {
    if (!DO_STOCKS_LIST) {
        return;
    }

    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/stocks`, {
            headers: {
                Authorization: apiKey,
            },
        });

        yield put(stocksListReceived(res.data));
    } catch (err) {
        yield put(stocksListReceived(null));
    }
}

export function* requestStocksPrices() {
    const stocks = yield select(getStocks);
    const indices = yield select(getIndices);

    const symbols = Array.from(new Set(stocks.concat(indices).map(({ code }) => code)));

    try {
        const data = yield call(getStockPrices, symbols);

        yield put(stockPricesReceived(data));
    } catch (err) {
        yield put(stockPricesReceived(null, err));
    }
}

export default function* fundsSaga() {
    yield takeLatest(FUNDS_REQUESTED, requestFundPeriodData);
    yield takeLatest(STOCKS_LIST_REQUESTED, requestStocksList);
    yield debounce(100, STOCKS_PRICES_REQUESTED, requestStocksPrices);
}
