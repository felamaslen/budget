import { expect } from 'chai';
import * as A from '../../src/actions/edit.actions';
import * as C from '../../src/constants/actions';

describe('edit.actions', () => {
    describe('aEditableActivated', () => {
        it('should return EDIT_ACTIVATED with req object', () => expect(A.aEditableActivated({
            foo: 'bar'
        })).to.deep.equal({
            type: C.EDIT_ACTIVATED,
            foo: 'bar'
        }));
    });
    describe('aEditableChanged', () => {
        it('should return EDIT_ACTIVATED with value', () =>
            expect(A.aEditableChanged('value')).to.deep.equal({
                type: C.EDIT_CHANGED,
                value: 'value'
            })
        );
    });
    describe('aListItemAdded', () => {
        it('should return EDIT_LIST_ITEM_ADDED with req object', () => {
            expect(A.aListItemAdded({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_LIST_ITEM_ADDED,
                foo: 'bar'
            });
        });
    });
    describe('aListItemDeleted', () => {
        it('should return EDIT_LIST_ITEM_DELETED with item', () => {
            expect(A.aListItemDeleted({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_LIST_ITEM_DELETED,
                foo: 'bar'
            });
        });
    });
    describe('aSuggestionsRequested', () => {
        const action = A.aSuggestionsRequested({ foo: 'bar' });

        it('should return EDIT_SUGGESTIONS_REQUESTED with a req object and random uuid', () => {
            expect(action).to.deep.include({
                type: C.EDIT_SUGGESTIONS_REQUESTED,
                foo: 'bar'
            });

            expect(action.reqId).to.be.a('number').greaterThan(0);
        });
    });
    describe('aSuggestionsReceived', () => {
        it('should return EDIT_SUGGESTIONS_RECEIVED with a response object', () =>
            expect(A.aSuggestionsReceived({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_SUGGESTIONS_RECEIVED,
                foo: 'bar'
            })
        );
    });
    describe('aFundTransactionsChanged', () =>
        it('should return EDIT_FUND_TRANSACTIONS_CHANGED with req object', () =>
            expect(A.aFundTransactionsChanged({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_FUND_TRANSACTIONS_CHANGED,
                foo: 'bar'
            })
        )
    );
    describe('aFundTransactionsAdded', () =>
        it('should return EDIT_FUND_TRANSACTIONS_ADDED with req object', () =>
            expect(A.aFundTransactionsAdded({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_FUND_TRANSACTIONS_ADDED,
                foo: 'bar'
            })
        )
    );
    describe('aFundTransactionsRemoved', () =>
        it('should return EDIT_FUND_TRANSACTIONS_REMOVED with req object', () =>
            expect(A.aFundTransactionsRemoved({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_FUND_TRANSACTIONS_REMOVED,
                foo: 'bar'
            })
        )
    );
});

