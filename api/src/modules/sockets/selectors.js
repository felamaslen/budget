import { createSelector } from 'reselect';

const staleTime = 60000;

export const getStocks = state => state.stocks;
export const getCurrencies = state => state.currencies;

const getFresh = items => {
    const now = Date.now();

    return items.filter(({ lastRequestTime }) => lastRequestTime > now - staleTime);
};

export const getFreshStocks = createSelector(getStocks, getFresh);
export const getFreshCurrencies = createSelector(getCurrencies, getFresh);

function filterToRefresh(items) {
    const now = Date.now();

    return items
        .filter(({ loading, socketIds, lastRequestTime }) => !loading &&
            socketIds.length &&
            !(lastRequestTime && lastRequestTime > now - staleTime)
        )
        .map(({ code }) => code);
}

export const getStocksToRefresh = createSelector(getStocks, filterToRefresh);
export const getCurrenciesToRefresh = createSelector(getCurrencies, filterToRefresh);
