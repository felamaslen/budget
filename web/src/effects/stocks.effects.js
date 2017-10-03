import { List as list } from 'immutable';
import axios from 'axios';

import { API_PREFIX } from '../misc/const';
import { getStockPricesFromYahoo } from '../misc/finance';

import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

export async function requestStocksList(dispatch, reduction) {
    const apiKey = reduction.getIn(['user', 'apiKey']);

    try {
        const response = await axios.get(`${API_PREFIX}/data/stocks`, {
            headers: { 'Authorization': apiKey }
        });

        return dispatch(aStocksListReceived(response.data.data));
    }
    catch (err) {
        return dispatch(aStocksListReceived(null));
    }
}

export async function requestStockPrices(dispatch, reduction) {
    const symbols = reduction.getIn(['other', 'stocksList', 'stocks'])
        .reduce((codes, item, code) => codes.push(code), list.of())
        .concat(reduction
            .getIn(['other', 'stocksList', 'indices'])
            .reduce((codes, item) => codes.push(item.get('code')), list.of())
        );

    try {
        const data = await getStockPricesFromYahoo(symbols);

        dispatch(aStocksPricesReceived(data));
    }
    catch (err) {
        dispatch(aStocksPricesReceived(null));
    }
}

