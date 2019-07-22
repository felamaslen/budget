import test from 'ava';
import { testState } from '~client-test/test_data/state';
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
        ...testState,
        funds: {
            ...testState.funds,
            items: [
                ...testState.funds.items,
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
        food: {
            ...testState.food,
            items: [
                ...testState.food.items,
                { id: 'real-id-z', other: 'this-prop', is: null, __optimistic: UPDATE }
            ]
        },
        general: {
            ...testState.general,
            items: [
                ...testState.general.items,
                { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
            ]
        },
        holiday: {
            ...testState.holiday,
            items: [
                ...testState.holiday.items,
                { id: 'real-id-x', thisProp: 'foo', is: false, __optimistic: DELETE }
            ]
        }
    }));

    t.true(getUnsaved({
        ...testState,
        netWorth: {
            ...testState.netWorth,
            categories: [
                ...testState.netWorth.categories,
                {
                    id: 'some-fake-id',
                    type: 'asset',
                    category: 'My asset',
                    color: '#00ff00',
                    __optimistic: CREATE
                }
            ]
        }
    }));

    t.true(getUnsaved({
        ...testState,
        netWorth: {
            ...testState.netWorth,
            subcategories: [
                ...testState.netWorth.subcategories,
                {
                    id: 'some-fake-id',
                    categoryId: 'some-category-id',
                    subcategory: 'My wallet',
                    hasCreditLimit: null,
                    opacity: 0,
                    __optimistic: CREATE
                }
            ]
        }
    }));

    t.true(getUnsaved({
        ...testState,
        netWorth: {
            ...testState.netWorth,
            entries: [
                ...testState.netWorth.entries,
                {
                    ...testState.netWorth.entries[0],
                    __optimistic: UPDATE
                }
            ]
        }
    }));

    t.false(getUnsaved({
        ...testState,
        funds: {
            ...testState.funds,
            items: [
                ...testState.funds.items,
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
        food: {
            ...testState.food,
            items: [
                ...testState.food.items,
                { id: 'real-id-z', other: 'this-prop', is: null, __optimistic: null }
            ]
        },
        general: {
            ...testState.general,
            items: [
                ...testState.general.items,
                { id: 'some-fake-id', some: 'prop', is: true, __optimistic: null }
            ]
        },
        holiday: {
            ...testState.holiday,
            items: [
                ...testState.holiday.items,
                { id: 'real-id-x', thisProp: 'foo', is: false }
            ]
        }
    }));
});
