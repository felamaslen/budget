import { expect } from 'chai';

import {
    aStocksListRequested,
    aStocksListReceived,
    aStocksPricesRequested,
    aStocksPricesReceived
} from '~client/actions/stocks-list.actions';

import {
    STOCKS_LIST_REQUESTED,
    STOCKS_LIST_RECEIVED,
    STOCKS_PRICES_REQUESTED,
    STOCKS_PRICES_RECEIVED
} from '~client/constants/actions';

describe('stocks-list.actions', () => {
    describe('aStocksListRequested', () =>
        it('should return STOCKS_LIST_REQUESTED', () =>
            expect(aStocksListRequested()).to.deep.equal({ type: STOCKS_LIST_REQUESTED })
        )
    );
    describe('aStocksListReceived', () =>
        it('should return STOCKS_LIST_RECEIVED with response object', () =>
            expect(aStocksListReceived({ foo: 'bar' })).to.deep.equal({
                type: STOCKS_LIST_RECEIVED, foo: 'bar'
            })
        )
    );
    describe('aStocksPricesRequested', () =>
        it('should return STOCKS_PRICES_REQUESTED', () =>
            expect(aStocksPricesRequested()).to.deep.equal({ type: STOCKS_PRICES_REQUESTED })
        )
    );
    describe('aStocksPricesReceived', () =>
        it('should return STOCKS_PRICES_RECEIVED with response object', () =>
            expect(aStocksPricesReceived({ foo: 'bar' })).to.deep.equal({
                type: STOCKS_PRICES_RECEIVED, foo: 'bar'
            })
        )
    );
});

