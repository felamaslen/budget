import test from 'ava';
import {
    getApiKey,
    getLocked,
    getUnsaved
} from '~client/selectors/api';
import { getTransactionsList } from '~client/modules/data';
import { CREATE, UPDATE, DELETE } from '~client/constants/data';

test('getApiKey gets the API key from the state', t => {
    t.is(getApiKey({
        api: {
            key: 'foo'
        }
    }), 'foo');
});

test('getLocked returns true iff the state is locked for synchronisation', t => {
    t.true(getLocked({ api: { locked: true } }));
    t.false(getLocked({ api: { locked: false } }));
    t.false(getLocked({ api: {} }));
});

test('getUnsaved returns true iff the state contains unsaved optimistic updates', t => {
    t.true(getUnsaved({
        income: { items: [] },
        funds: {
            items: [
                {
                    id: 'some-fund-id',
                    name: 'some-fund-name',
                    transactions: getTransactionsList([
                        { date: '2019-05-03', units: 103, cost: 99231 }
                    ]),
                    __optimistic: UPDATE
                }
            ]
        },
        bills: { items: [] },
        food: {
            items: [
                { id: 'real-id-z', other: 'this-prop', is: null, __optimistic: UPDATE }
            ]
        },
        general: {
            items: [
                { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
            ]
        },
        holiday: {
            items: [
                { id: 'real-id-x', thisProp: 'foo', is: false, __optimistic: DELETE }
            ]
        },
        social: { items: [] }
    }));

    t.false(getUnsaved({
        income: { items: [] },
        funds: {
            items: [
                {
                    id: 'some-fund-id',
                    name: 'some-fund-name',
                    transactions: getTransactionsList([
                        { date: '2019-05-03', units: 103, cost: 99231 }
                    ]),
                    __optimistic: null
                }
            ]
        },
        bills: { items: [] },
        food: {
            items: [
                { id: 'real-id-z', other: 'this-prop', is: null, __optimistic: null }
            ]
        },
        general: {
            items: [
                { id: 'some-fake-id', some: 'prop', is: true, __optimistic: null }
            ]
        },
        holiday: {
            items: [
                { id: 'real-id-x', thisProp: 'foo', is: false }
            ]
        },
        social: { items: [] }
    }));
});
