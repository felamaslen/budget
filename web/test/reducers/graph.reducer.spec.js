import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/graph.reducer';

describe('Graph reducer', () => {
    describe('rToggleShowAll', () => {
        it('should toggle showAllBalanceGraph', () => {
            expect(R.rToggleShowAll(fromJS({ other: { showAllBalanceGraph: true } }))
                .getIn(['other', 'showAllBalanceGraph'])).to.equal(false);

            expect(R.rToggleShowAll(fromJS({ other: { showAllBalanceGraph: false } }))
                .getIn(['other', 'showAllBalanceGraph'])).to.equal(true);

            expect(R.rToggleShowAll(fromJS({ other: { showAllBalanceGraph: null } }))
                .getIn(['other', 'showAllBalanceGraph'])).to.equal(true);
        });
    });
    describe('rToggleFundItemGraph', () => {
        it('should toggle historyPopout for the given key', () => {
            expect(R.rToggleFundItemGraph(fromJS({
                pages: [
                    null,
                    null,
                    { rows: [null, { historyPopout: false }, null] }
                ]
            }), { key: 1 }).getIn(['pages', 2, 'rows', 1, 'historyPopout'])).to.equal(true);

            expect(R.rToggleFundItemGraph(fromJS({
                pages: [
                    null,
                    null,
                    { rows: [null, { historyPopout: true }, null] }
                ]
            }), { key: 1 }).getIn(['pages', 2, 'rows', 1, 'historyPopout'])).to.equal(false);
        });
    });
    describe('rToggleFundsGraphMode', () => {
        it('should be tested');
    });
    describe('rZoomFundsGraph', () => {
        it('should be tested');
    });
    describe('rHoverFundsGraph', () => {
        it('should be tested');
    });
    describe('rToggleFundsGraphLine', () => {
        it('should be tested');
    });
    describe('rHandleFundPeriodResponse', () => {
        it('should be tested');
    });
    describe('rChangeFundsGraphPeriod', () => {
        it('should be tested');
    });
});

