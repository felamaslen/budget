/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { shallow } from 'enzyme';
import React from 'react';
import FormFieldTransactions from '../../../src/components/form-field/transactions';
import { TransactionsList } from '../../../src/misc/data';
import { dateInput } from '../../../src/misc/date';
import FormFieldDate from '../../../src/components/form-field/date';
import FormFieldNumber from '../../../src/components/form-field/number';
import FormFieldCost from '../../../src/components/form-field/cost';

describe('<FormFieldTransactions />', () => {
    let date = null;
    let units = null;
    let cost = null;

    const onDateChange = (value, _ymd, key) => {
        date = { value, ymd: _ymd, key };
    };

    const onUnitsChange = (value, _units, key) => {
        units = { value, units: _units, key };
    };

    const onCostChange = (value, _cost, key) => {
        cost = { value, cost: _cost, key };
    };

    const transactions = [
        { date: '2017-11-10', units: 10.5, cost: 50 },
        { date: '2018-09-05', units: -3, cost: -40 }
    ];

    const value = new TransactionsList(transactions);

    const props = {
        value,
        onDateChange,
        onUnitsChange,
        onCostChange
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<FormFieldTransactions {...props} />);

        expect(wrapper.is('ul.transactions-list')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
    });

    let key = 0;

    beforeEach(() => {
        date = null;
        units = null;
        cost = null;
    });

    // eslint-disable-next-line max-statements
    it.each(transactions, 'should render a list of transactions', ({
        date: iDate, units: iUnits, cost: iCost
    }) => {

        const wrapper = shallow(<FormFieldTransactions {...props} />);

        expect(wrapper.childAt(key).is('li')).to.equal(true);
        expect(wrapper.childAt(key).children()).to.have.length(1);
        expect(wrapper.childAt(key).childAt(0).is('span.transaction')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).children()).to.have.length(3);

        // test the date input
        expect(wrapper.childAt(key).childAt(0).childAt(0).is('span.row')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(0).children()).to.have.length(2);
        expect(wrapper.childAt(key).childAt(0).childAt(0).childAt(0).is('span.col')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(0).childAt(0).text()).to.equal('Date:');
        expect(wrapper.childAt(key).childAt(0).childAt(0).childAt(1).is('span.col')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(0).childAt(1).children()).to.have.length(1);
        expect(wrapper.childAt(key).childAt(0).childAt(0).childAt(1).childAt(0).is(FormFieldDate))
            .to.equal(true);

        expect(wrapper.childAt(key).childAt(0).childAt(0).childAt(1).childAt(0).props().value
            .toISODate())
            .to.equal(iDate);

        expect(date).to.equal(null);
        wrapper.childAt(key).childAt(0).childAt(0).childAt(1).childAt(0).props().onChange(dateInput('5/4/16'));
        expect(date).to.deep.equal({ value, ymd: dateInput('5/4/16'), key });

        // test the units input
        expect(wrapper.childAt(key).childAt(0).childAt(1).is('span.row')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(1).children()).to.have.length(2);
        expect(wrapper.childAt(key).childAt(0).childAt(1).childAt(0).is('span.col')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(1).childAt(0).text()).to.equal('Units:');
        expect(wrapper.childAt(key).childAt(0).childAt(1).childAt(1).is('span.col')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(1).childAt(1).children()).to.have.length(1);
        expect(wrapper.childAt(key).childAt(0).childAt(1).childAt(1).childAt(0).is(FormFieldNumber))
            .to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(1).childAt(1).childAt(0).props())
            .to.have.property('value', iUnits);

        expect(units).to.equal(null);
        wrapper.childAt(key).childAt(0).childAt(1).childAt(1).childAt(0).props().onChange(1000);
        expect(units).to.deep.equal({ value, units: 1000, key });

        // test the units input
        expect(wrapper.childAt(key).childAt(0).childAt(2).is('span.row')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(2).children()).to.have.length(2);
        expect(wrapper.childAt(key).childAt(0).childAt(2).childAt(0).is('span.col')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(2).childAt(0).text()).to.equal('Cost:');
        expect(wrapper.childAt(key).childAt(0).childAt(2).childAt(1).is('span.col')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(2).childAt(1).children()).to.have.length(1);
        expect(wrapper.childAt(key).childAt(0).childAt(2).childAt(1).childAt(0).is(FormFieldCost))
            .to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(2).childAt(1).childAt(0).props())
            .to.have.property('value', iCost);

        expect(cost).to.equal(null);
        wrapper.childAt(key).childAt(0).childAt(2).childAt(1).childAt(0).props().onChange(2000);
        expect(cost).to.deep.equal({ value, cost: 2000, key });

        key++;

        date = null;
        units = null;
        cost = null;
    });
});
