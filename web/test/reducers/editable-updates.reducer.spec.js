import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/editable-updates.reducer';
import * as M from '../../src/misc/data';

describe('Editable updates reducer', () => {
    describe('resortListRows', () => {
        it('should sort rows and add weekly averages', () => {
            const state = fromJS({
                pages: [
                    null,
                    null,
                    { rows: [], data: {} }
                ]
            });

            const result = R.resortListRows(state, { pageIndex: 2 });

            expect(result.getIn(['pages', 2, 'rows']).toJS()).to.deep.equal(
                M.sortRowsByDate(state.getIn(['pages', 2, 'rows']), 2)
                    .toJS()
            );

            expect(result.getIn(['pages', 2, 'data']).toJS()).to.deep.equal(
                M.addWeeklyAverages(state.getIn(['pages', 2, 'data']), 2)
                    .toJS()
            );
        });
    });

    describe('recalculateFundProfits', () => {
        it('should be tested');
    });

    describe('applyEditsOverview', () => {
        it('should be tested');
    });

    describe('applyEditsList', () => {
        it('should be tested');
    });

    describe('applyEdits', () => {
        it('should be tested');
    });

    describe('rDeleteListItem', () => {
        it('should be tested');
    });
});

