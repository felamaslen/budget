/* eslint-disable @typescript-eslint/explicit-function-return-type */
import querystring from 'querystring';
import axios from 'axios';
import { debounce, select, takeLatest, call, put } from 'redux-saga/effects';

import {
  ActionTypeFunds,
  ActionTypeStocks,
  FundsRequested,
  errorOpened,
  fundsReceived,
  stocksListReceived,
  stockPricesReceived,
  CashTargetUpdated,
} from '~client/actions';
import { API_PREFIX } from '~client/constants/data';
import { ErrorLevel } from '~client/constants/error';
import { DO_STOCKS_LIST } from '~client/constants/stocks';
import { getPeriodMatch } from '~client/modules/data';
import { getStockPrices } from '~client/modules/finance';
import { periodStoreKey } from '~client/reducers/funds';
import { getApiKey, getFundsCache, getPeriod, getStocks, getIndices } from '~client/selectors';

export function* getFundHistoryQuery(period = null) {
  const nextPeriod = period || (yield select(getPeriod));

  const periodMatch = getPeriodMatch(nextPeriod);

  return { ...periodMatch, history: true };
}

export function* requestFundPeriodData({ period, fromCache }: FundsRequested) {
  if (period) {
    yield call([localStorage, 'setItem'], periodStoreKey, period);
  }
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
    yield put(stocksListReceived(undefined, err));
  }
}

export function* requestStocksPrices() {
  const stocks = yield select(getStocks);
  const indices = yield select(getIndices);

  const symbols: string[] = Array.from(new Set([...stocks, ...indices].map(({ code }) => code)));

  try {
    const data = yield call(getStockPrices, symbols);

    yield put(stockPricesReceived(data));
  } catch (err) {
    yield put(stockPricesReceived(undefined, err));
  }
}

export function* updateCashTarget({ cashTarget }: CashTargetUpdated) {
  const apiKey = yield select(getApiKey);
  try {
    yield call(
      axios.put,
      `${API_PREFIX}/data/funds/cash-target`,
      { cashTarget },
      {
        headers: {
          Authorization: apiKey,
        },
      },
    );
  } catch (err) {
    yield errorOpened(`Error updating cash target: ${err.message}`, ErrorLevel.Err);
  }
}

export default function* fundsSaga() {
  yield takeLatest(ActionTypeFunds.Requested, requestFundPeriodData);
  yield takeLatest(ActionTypeStocks.Requested, requestStocksList);
  yield debounce(100, ActionTypeStocks.PricesRequested, requestStocksPrices);
  yield debounce(100, ActionTypeFunds.CashTargetUpdated, updateCashTarget);
}
