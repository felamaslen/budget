import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import reduction from '~client/reduction';

import FormField from '~client/containers/FormField';

import { aFormFieldChanged } from '~client/actions/form.actions';

import { dateInput } from '~client/modules/date';
import { TransactionsList } from '~client/modules/data';

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

const transactionsListValue = new TransactionsList([
    { date: '2017-05-03', units: 34, cost: 12 },
    { date: '2018-10-11', units: 10, cost: 5 }
], true);

const transactionsListEdited = new TransactionsList([
    { date: '2017-05-03', units: 34, cost: 12 },
    { date: '2018-10-11', units: 10.197, cost: 5 }
], true);

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
        changedValue: 10335,
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
        changeArgs: [transactionsListValue, 1, 10.197, 'units'],
        action: aFormFieldChanged(3, transactionsListEdited)
    }
];

testCases.forEach(({ name, fieldKey, props }) => {
    test(`rendering ${name} component`, t => {
        const { container } = getContainer({ fieldKey, ...props });

        t.is(container.childNodes.length, 1);
    });
});
