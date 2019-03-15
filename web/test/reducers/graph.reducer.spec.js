import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '~client/reducers/graph.reducer';

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
    describe('rToggleFundsGraphMode', () => {
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

