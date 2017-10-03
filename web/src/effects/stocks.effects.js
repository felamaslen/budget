import { List as list } from 'immutable';
import axios from 'axios';

import { API_PREFIX } from '../misc/const';

import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

import { randnBm } from '../misc/data';

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

export function requestStockPrices(dispatch, reduction) {
    const symbols = reduction.getIn(['other', 'stocksList', 'stocks'])
        .reduce((codes, item, code) => codes.push(code), list.of())
        .concat(reduction
            .getIn(['other', 'stocksList', 'indices'])
            .reduce((codes, item) => codes.push(item.get('code')), list.of())
        );

    // TODO: get actual prices
    const data = symbols.map((code, key) => ({ code, open: 100 + key, close: 100 + key + randnBm() * (key + 1) / 10 }));

    setTimeout(() => dispatch(aStocksPricesReceived(data)), 100);
}

