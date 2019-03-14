/* eslint-disable newline-per-chained-call */
import '../../browser';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';

import FormField from '../../../src/containers/FormField';
import FormFieldText from '../../../src/components/FormField';
import FormFieldDate from '../../../src/components/FormField/date';
import FormFieldCost from '../../../src/components/FormField/cost';
import FormFieldTransactions from '../../../src/components/FormField/transactions';

import { aFormFieldChanged } from '../../../src/actions/form.actions';

import { dateInput } from '../../../src/helpers/date';
import { TransactionsList } from '../../../src/helpers/data';

describe('<FormField />', () => {
    itEach({ testPerIteration: true });

    const dateValue = dateInput('3/4');

    const transactionsListValue = new TransactionsList([
        { date: '2017-05-03', units: 34, cost: 12 },
        { date: '2018-10-11', units: 10, cost: 5 }
    ], true);

    const transactionsListEdited = new TransactionsList([
        { date: '2017-05-03', units: 34, cost: 12 },
        { date: '2018-10-11', units: 10.197, cost: 5 }
    ], true);

    it.each([
        {
            name: 'date',
            component: FormFieldDate,
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
            component: FormFieldCost,
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
            component: FormFieldText,
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
            component: FormFieldTransactions,
            fieldKey: 3,
            props: {
                item: 'transactions',
                value: transactionsListValue
            },
            changeArgs: [transactionsListValue, 1, 10.197, 'units'],
            action: aFormFieldChanged(3, transactionsListEdited)
        }
    ], 'should return a %s component', ['name'], ({ component, fieldKey, props, changedValue, action, changeArgs = [changedValue] }) => {
        const store = createMockStore(fromJS({}));

        const wrapper = shallow(<FormField fieldKey={fieldKey} {...props} />, store).dive();

        expect(wrapper.is(component)).to.equal(true);
        expect(wrapper.props()).to.have.property('value', props.value);

        expect(store.getActions()).to.have.length(0);

        wrapper.prop('onChange')(...changeArgs);

        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(JSON.stringify(actions[0])).to.equal(JSON.stringify(action));
    });
});

