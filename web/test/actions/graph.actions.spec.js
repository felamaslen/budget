import { expect } from 'chai';

import * as A from '../../src/actions/graph.actions';
import * as C from '../../src/constants/actions';

describe('graph.actions', () => {
    describe('aShowAllToggled', () =>
        it('should return GRAPH_SHOWALL_TOGGLED', () =>
            expect(A.aShowAllToggled()).to.deep.equal({ type: C.GRAPH_SHOWALL_TOGGLED })
        )
    );
    describe('aFundItemGraphToggled', () =>
        it('should return GRAPH_FUND_ITEM_TOGGLED with key', () =>
            expect(A.aFundItemGraphToggled(10)).to.deep.equal({
                type: C.GRAPH_FUND_ITEM_TOGGLED, key: 10
            })
        )
    );
    describe('aFundsGraphClicked', () =>
        it('should return GRAPH_FUNDS_CLICKED', () =>
            expect(A.aFundsGraphClicked()).to.deep.equal({ type: C.GRAPH_FUNDS_CLICKED })
        )
    );
    describe('aFundsGraphZoomed', () =>
        it('should return GRAPH_FUNDS_ZOOMED with req object', () =>
            expect(A.aFundsGraphZoomed({ foo: 'bar' })).to.deep.equal({
                type: C.GRAPH_FUNDS_ZOOMED, foo: 'bar'
            })
        )
    );
    describe('aFundsGraphHovered', () =>
        it('should return GRAPH_FUNDS_HOVERED with position object', () =>
            expect(A.aFundsGraphHovered({ posX: 10 })).to.deep.equal({
                type: C.GRAPH_FUNDS_HOVERED, position: { posX: 10 }
            })
        )
    );
    describe('aFundsGraphLineToggled', () =>
        it('should return GRAPH_FUNDS_LINE_TOGGLED with index', () =>
            expect(A.aFundsGraphLineToggled(10)).to.deep.equal({
                type: C.GRAPH_FUNDS_LINE_TOGGLED, index: 10
            })
        )
    );
    describe('aFundsGraphPeriodReceived', () =>
        it('should return GRAPH_FUNDS_PERIOD_LOADED with res object', () =>
            expect(A.aFundsGraphPeriodReceived({ foo: 'bar' })).to.deep.equal({
                type: C.GRAPH_FUNDS_PERIOD_LOADED, foo: 'bar'
            })
        )
    );
    describe('aFundsGraphPeriodChanged', () =>
        it('should return GRAPH_FUNDS_PERIOD_CHANGED with req object', () =>
            expect(A.aFundsGraphPeriodChanged({ foo: 'bar' })).to.deep.equal({
                type: C.GRAPH_FUNDS_PERIOD_CHANGED, foo: 'bar'
            })
        )
    );
});

