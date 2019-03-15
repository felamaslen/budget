import { expect } from 'chai';

import {
    aEditableActivated,
    aEditableChanged,
    aListItemAdded,
    aListItemDeleted,
    aFundTransactionsAdded,
    aFundTransactionsChanged,
    aFundTransactionsRemoved,
    aSuggestionsRequested,
    aSuggestionsReceived
} from '~client/actions/edit.actions';

import {
    EDIT_ACTIVATED,
    EDIT_CHANGED,
    EDIT_LIST_ITEM_ADDED,
    EDIT_LIST_ITEM_DELETED,
    EDIT_FUND_TRANSACTIONS_ADDED,
    EDIT_FUND_TRANSACTIONS_CHANGED,
    EDIT_FUND_TRANSACTIONS_REMOVED,
    EDIT_SUGGESTIONS_REQUESTED,
    EDIT_SUGGESTIONS_RECEIVED
} from '~client/constants/actions';

describe('edit.actions', () => {
    describe('aEditableActivated', () => {
        it('should return EDIT_ACTIVATED with req object', () => expect(aEditableActivated({
            foo: 'bar'
        })).to.deep.equal({
            type: EDIT_ACTIVATED,
            foo: 'bar'
        }));
    });
    describe('aEditableChanged', () => {
        it('should return EDIT_ACTIVATED with value', () =>
            expect(aEditableChanged('value')).to.deep.equal({
                type: EDIT_CHANGED,
                value: 'value'
            })
        );
    });
    describe('aListItemAdded', () => {
        it('should return EDIT_LIST_ITEM_ADDED with req object', () => {
            expect(aListItemAdded({ foo: 'bar' })).to.deep.equal({
                type: EDIT_LIST_ITEM_ADDED,
                foo: 'bar'
            });
        });
    });
    describe('aListItemDeleted', () => {
        it('should return EDIT_LIST_ITEM_DELETED with item', () => {
            expect(aListItemDeleted({ foo: 'bar' })).to.deep.equal({
                type: EDIT_LIST_ITEM_DELETED,
                foo: 'bar'
            });
        });
    });
    describe('aSuggestionsRequested', () => {
        const action = aSuggestionsRequested({ foo: 'bar' });

        it('should return EDIT_SUGGESTIONS_REQUESTED with a req object and random uuid', () => {
            expect(action).to.deep.include({
                type: EDIT_SUGGESTIONS_REQUESTED,
                foo: 'bar'
            });

            expect(action.reqId).to.be.a('number').greaterThan(0);
        });
    });
    describe('aSuggestionsReceived', () => {
        it('should return EDIT_SUGGESTIONS_RECEIVED with a response object', () =>
            expect(aSuggestionsReceived({ foo: 'bar' })).to.deep.equal({
                type: EDIT_SUGGESTIONS_RECEIVED,
                foo: 'bar'
            })
        );
    });
    describe('aFundTransactionsChanged', () =>
        it('should return EDIT_FUND_TRANSACTIONS_CHANGED with req object', () =>
            expect(aFundTransactionsChanged({ foo: 'bar' })).to.deep.equal({
                type: EDIT_FUND_TRANSACTIONS_CHANGED,
                foo: 'bar'
            })
        )
    );
    describe('aFundTransactionsAdded', () =>
        it('should return EDIT_FUND_TRANSACTIONS_ADDED with req object', () =>
            expect(aFundTransactionsAdded({ foo: 'bar' })).to.deep.equal({
                type: EDIT_FUND_TRANSACTIONS_ADDED,
                foo: 'bar'
            })
        )
    );
    describe('aFundTransactionsRemoved', () =>
        it('should return EDIT_FUND_TRANSACTIONS_REMOVED with req object', () =>
            expect(aFundTransactionsRemoved({ foo: 'bar' })).to.deep.equal({
                type: EDIT_FUND_TRANSACTIONS_REMOVED,
                foo: 'bar'
            })
        )
    );
});

