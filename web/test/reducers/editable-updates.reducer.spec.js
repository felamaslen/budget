import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/editable-updates.reducer';
import * as M from '../../src/helpers/data';

describe('Editable updates reducer', () => {
    describe('resortListRows', () => {
        it('should sort rows and add weekly averages', () => {
            const state = fromJS({
                pages: {
                    funds: {
                        rows: {},
                        data: {}
                    }
                }
            });

            const result = R.resortListRows(state, { page: 'funds' });

            expect(result.getIn(['pages', 'funds', 'rows']).toJS()).to.deep.equal(
                M.sortRowsByDate(state.getIn(['pages', 'funds', 'rows']), 'funds')
                    .toJS()
            );

            expect(result.getIn(['pages', 'funds', 'data']).toJS()).to.deep.equal(
                M.addWeeklyAverages(
                    state.getIn(['pages', 'funds', 'data']),
                    state.getIn(['pages', 'funds', 'rows']),
                    'funds'
                )
                    .toJS()
            );
        });
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

