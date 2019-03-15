import { expect } from 'chai';

import {
    aShowAllToggled,
    aFundsGraphClicked,
    aFundsGraphLineToggled,
    aFundsGraphPeriodChanged,
    aFundsGraphPeriodReceived
} from '~client/actions/graph.actions';

import {
    GRAPH_SHOWALL_TOGGLED,
    GRAPH_FUNDS_LINE_TOGGLED,
    GRAPH_FUNDS_CLICKED,
    GRAPH_FUNDS_PERIOD_LOADED,
    GRAPH_FUNDS_PERIOD_CHANGED
} from '~client/constants/actions';

describe('graph.actions', () => {
    describe('aShowAllToggled', () =>
        it('should return GRAPH_SHOWALL_TOGGLED', () =>
            expect(aShowAllToggled()).to.deep.equal({ type: GRAPH_SHOWALL_TOGGLED })
        )
    );
    describe('aFundsGraphClicked', () =>
        it('should return GRAPH_FUNDS_CLICKED', () =>
            expect(aFundsGraphClicked()).to.deep.equal({ type: GRAPH_FUNDS_CLICKED })
        )
    );
    describe('aFundsGraphLineToggled', () =>
        it('should return GRAPH_FUNDS_LINE_TOGGLED with index', () =>
            expect(aFundsGraphLineToggled(10)).to.deep.equal({
                type: GRAPH_FUNDS_LINE_TOGGLED, index: 10
            })
        )
    );
    describe('aFundsGraphPeriodReceived', () =>
        it('should return GRAPH_FUNDS_PERIOD_LOADED with res object', () =>
            expect(aFundsGraphPeriodReceived({ foo: 'bar' })).to.deep.equal({
                type: GRAPH_FUNDS_PERIOD_LOADED, foo: 'bar'
            })
        )
    );
    describe('aFundsGraphPeriodChanged', () =>
        it('should return GRAPH_FUNDS_PERIOD_CHANGED with req object', () =>
            expect(aFundsGraphPeriodChanged({ foo: 'bar' })).to.deep.equal({
                type: GRAPH_FUNDS_PERIOD_CHANGED, foo: 'bar'
            })
        )
    );
});

