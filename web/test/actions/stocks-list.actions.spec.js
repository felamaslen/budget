import { expect } from 'chai';

import * as A from '../../src/actions/stocks-list.actions';
import * as C from '../../src/constants/actions';

describe('stocks-list.actions', () => {
    describe('aStocksListRequested', () =>
        it('should return STOCKS_LIST_REQUESTED', () =>
            expect(A.aStocksListRequested()).to.deep.equal({ type: C.STOCKS_LIST_REQUESTED, payload: null })
        )
    )
    describe('aStocksListReceived', () =>
        it('should return STOCKS_LIST_RECEIVED with response object', () =>
            expect(A.aStocksListReceived({ foo: 'bar' })).to.deep.equal({
                type: C.STOCKS_LIST_RECEIVED, payload: { foo: 'bar' }
            })
        )
    )
    describe('aStocksPricesRequested', () =>
        it('should return STOCKS_PRICES_REQUESTED', () =>
            expect(A.aStocksPricesRequested()).to.deep.equal({ type: C.STOCKS_PRICES_REQUESTED, payload: null })
        )
    )
    describe('aStocksPricesReceived', () =>
        it('should return STOCKS_PRICES_RECEIVED with response object', () =>
            expect(A.aStocksPricesReceived({ foo: 'bar' })).to.deep.equal({
                type: C.STOCKS_PRICES_RECEIVED, payload: { foo: 'bar' }
            })
        )
    )
})

