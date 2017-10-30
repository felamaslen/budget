import { expect } from 'chai';

import * as A from '../../src/actions/edit.actions';
import * as C from '../../src/constants/actions';

describe('edit.actions', () => {
    describe('aEditableActivated', () => {
        it('should return EDIT_ACTIVATED with req object', () => expect(A.aEditableActivated({
            foo: 'bar'
        })).to.deep.equal({
            type: C.EDIT_ACTIVATED,
            payload: { foo: 'bar' }
        }));
    });
    describe('aEditableChanged', () => {
        it('should return EDIT_ACTIVATED with value', () =>
            expect(A.aEditableChanged('value')).to.deep.equal({
                type: C.EDIT_CHANGED,
                payload: 'value'
            })
        );
    });
    describe('aListItemAdded', () => {
        it('should return EDIT_LIST_ITEM_ADDED with req object', () => {
            expect(A.aListItemAdded({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_LIST_ITEM_ADDED,
                payload: { foo: 'bar' }
            });
        });
    });
    describe('aListItemDeleted', () => {
        it('should return EDIT_LIST_ITEM_DELETED with item', () => {
            expect(A.aListItemDeleted(10)).to.deep.equal({ type: C.EDIT_LIST_ITEM_DELETED, payload: 10 });
        });
    });
    describe('aSuggestionsRequested', () => {
        const action1 = A.aSuggestionsRequested({ foo: 'bar' });
        const action2 = A.aSuggestionsRequested({ bar: 'baz' });

        it('should return EDIT_SUGGESTIONS_REQUESTED with a req object and random uuid', () => {
            expect(action1.payload.foo).to.equal('bar');
            expect(action2.payload.bar).to.equal('baz');

            expect(action1.payload.reqId).to.be.a('number');
            expect(action2.payload.reqId).to.be.a('number');
            expect(action1.payload.reqId).to.not.equal(action2.payload.reqId);
        });
    });
    describe('aSuggestionsReceived', () => {
        it('should return EDIT_SUGGESTIONS_RECEIVED with a response object', () =>
            expect(A.aSuggestionsReceived({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_SUGGESTIONS_RECEIVED,
                payload: { foo: 'bar' }
            })
        );
    });
    describe('aFundTransactionsChanged', () =>
        it('should return EDIT_FUND_TRANSACTIONS_CHANGED with req object', () =>
            expect(A.aFundTransactionsChanged({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_FUND_TRANSACTIONS_CHANGED, payload: { foo: 'bar' }
            })
        )
    );
    describe('aFundTransactionsAdded', () =>
        it('should return EDIT_FUND_TRANSACTIONS_ADDED with req object', () =>
            expect(A.aFundTransactionsAdded({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_FUND_TRANSACTIONS_ADDED, payload: { foo: 'bar' }
            })
        )
    );
    describe('aFundTransactionsRemoved', () =>
        it('should return EDIT_FUND_TRANSACTIONS_REMOVED with req object', () =>
            expect(A.aFundTransactionsRemoved({ foo: 'bar' })).to.deep.equal({
                type: C.EDIT_FUND_TRANSACTIONS_REMOVED, payload: { foo: 'bar' }
            })
        )
    );
});

