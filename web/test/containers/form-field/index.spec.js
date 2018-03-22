/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import getFormField from '../../../src/containers/form-field';
import { dateInput } from '../../../src/helpers/date';
import { TransactionsList } from '../../../src/helpers/data';

describe('<FormField />', () => {
    describe('Date', () => {
        const value = dateInput(null, false);

        const FormField = getFormField({ fieldKey: 0, item: 'date', value });

        const wrapper = shallow(<FormField />, createMockStore(fromJS({}))).dive();

        it('should return a <FormFieldDate /> component', () => {
            expect(wrapper.is('div.form-field.form-field-date')).to.equal(true);
        });
    });
    describe('Cost', () => {
        const FormField = getFormField({ fieldKey: 0, item: 'cost', value: 39523 });

        const wrapper = shallow(<FormField />, createMockStore(fromJS({}))).dive();

        it('should return a <FormFieldCost /> component', () => {
            expect(wrapper.is('div.form-field.form-field-cost')).to.equal(true);
        });
    });
    describe('Transactions', () => {
        const value = new TransactionsList([]);

        const FormField = getFormField({ fieldKey: 0, item: 'transactions', value });

        const wrapper = shallow(<FormField />, createMockStore(fromJS({}))).dive();

        it('should return a <FormFieldTransactions /> component', () => {
            expect(wrapper.is('ul.transactions-list')).to.equal(true);
        });
    });
});

