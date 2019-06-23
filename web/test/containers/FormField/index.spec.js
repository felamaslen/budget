import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import reduction from '~client/reduction';

import FormField from '~client/containers/FormField';

import { aFormFieldChanged } from '~client/actions/form.actions';

import { dateInput } from '~client/modules/date';
import { getTransactionsList, modifyTransaction } from '~client/modules/data';

const getContainer = memoize((customProps = {}) => {
    const state = reduction;

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <FormField {...props} />
        </Provider>
    );

    return { store, ...utils };
});

const dateValue = dateInput('3/4');

const transactionsListValue = getTransactionsList([
    { date: '2017-05-03', units: 34, cost: 12 },
    { date: '2018-10-11', units: 10, cost: 5 }
]);

const transactionsListEditDate = modifyTransaction(transactionsListValue, 1, {
    date: '2018-07-13'
});

const transactionsListEditUnits = modifyTransaction(transactionsListValue, 1, {
    units: 13
});

const transactionsListEditCost = modifyTransaction(transactionsListValue, 1, {
    cost: 11
});

const testCases = [
    {
        name: 'date',
        fieldKey: 0,
        props: {
            item: 'date',
            value: dateInput(null, false)
        },
        changedValue: dateValue,
        action: aFormFieldChanged(0, dateValue)
    },
    {
        name: 'cost',
        fieldKey: 1,
        props: {
            item: 'cost',
            value: 56734
        },
        changedValue: 103.35,
        action: aFormFieldChanged(1, 10335)
    },
    {
        name: 'text',
        fieldKey: 2,
        props: {
            item: 'name',
            value: 'foo'
        },
        changedValue: 'bar',
        action: aFormFieldChanged(2, 'bar')
    },
    {
        name: 'transactions',
        fieldKey: 3,
        props: {
            item: 'transactions',
            value: transactionsListValue
        },
        changedValue: {
            date: '2018-07-13',
            units: 13,
            cost: 0.11
        },
        action: {
            date: aFormFieldChanged(3, transactionsListEditDate),
            units: aFormFieldChanged(3, transactionsListEditUnits),
            cost: aFormFieldChanged(3, transactionsListEditCost)
        }
    }
];

testCases.forEach(({ name, fieldKey, props, changedValue, action }) => {
    const { store, container } = getContainer({ fieldKey, ...props });
    const [wrapper] = container.childNodes;

    test(`rendering ${name} component`, t => {
        t.is(container.childNodes.length, 1);
    });

    // eslint-disable-next-line max-statements
    test(`[${name}] changing input`, t => {
        if (['date', 'cost', 'text'].includes(name)) {
            const [input] = wrapper.childNodes;

            t.false(store.isActionDispatched(action));
            fireEvent.change(input, { target: { value: changedValue } });
            fireEvent.blur(input);

            t.true(store.isActionDispatched(action));
        } else if (name === 'transactions') {
            const [, li] = wrapper.childNodes;
            const [transaction] = li.childNodes;

            const [rowDate, rowUnits, rowCost] = transaction.childNodes;

            const [, colDate] = rowDate.childNodes;
            const [fieldDate] = colDate.childNodes;
            const [inputDate] = fieldDate.childNodes;

            const [, colUnits] = rowUnits.childNodes;
            const [fieldUnits] = colUnits.childNodes;
            const [inputUnits] = fieldUnits.childNodes;

            const [, colCost] = rowCost.childNodes;
            const [fieldCost] = colCost.childNodes;
            const [inputCost] = fieldCost.childNodes;

            t.false(store.isActionDispatched(action.date));
            t.false(store.isActionDispatched(action.units));
            t.false(store.isActionDispatched(action.cost));

            fireEvent.change(inputDate, { target: { value: changedValue.date } });
            fireEvent.blur(inputDate);

            t.true(store.isActionDispatched(action.date));
            t.false(store.isActionDispatched(action.units));
            t.false(store.isActionDispatched(action.cost));

            fireEvent.change(inputUnits, { target: { value: changedValue.units } });
            fireEvent.blur(inputUnits);

            t.true(store.isActionDispatched(action.date));
            t.true(store.isActionDispatched(action.units));
            t.false(store.isActionDispatched(action.cost));

            fireEvent.change(inputCost, { target: { value: changedValue.cost } });
            fireEvent.blur(inputCost);

            t.true(store.isActionDispatched(action.date));
            t.true(store.isActionDispatched(action.units));
            t.true(store.isActionDispatched(action.cost));
        } else {
            throw new Error(`unhandled form type: ${wrapper.className}`);
        }
    });
});
