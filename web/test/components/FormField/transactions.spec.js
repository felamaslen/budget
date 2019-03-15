/* eslint-disable newline-per-chained-call */
import '~client-test/browser.js';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import itEach from 'it-each';
itEach();
import 'react-testing-library/cleanup-after-each';
import { render, fireEvent } from 'react-testing-library';
import { DateTime } from 'luxon';
import React from 'react';
import FormFieldTransactions from '~client/components/FormField/transactions';
import { TransactionsList } from '~client/helpers/data';

describe('<FormFieldTransactions />', () => {
    const transactions = [
        { date: '2017-11-10', units: 10.5, cost: 50 },
        { date: '2018-09-05', units: -3, cost: -40 }
    ];

    const value = new TransactionsList(transactions);

    it('should render its basic structure', () => {
        const onChange = sinon.spy();
        const { container } = render(<FormFieldTransactions
            value={value}
            onChange={onChange}
        />);

        const [ul] = container.childNodes;

        expect(ul.tagName).to.equal('UL');
        expect(ul.className).to.equal('transactions-list');

        expect(ul.childNodes).to.have.length(2);
    });

    let index = null;

    beforeEach(() => {
        index = 0;
    });

    it.each(transactions, 'should render a list of transactions', () => {
        const onChange = sinon.spy();

        const { container } = render(<FormFieldTransactions
            value={value}
            onChange={onChange}
        />);

        const [ul] = container.childNodes;
        const li = ul.childNodes[index];

        expect(li.tagName).to.equal('LI');
        expect(li.childNodes).to.have.length(1);

        const [transaction] = li.childNodes;

        expect(transaction.tagName).to.equal('SPAN');
        expect(transaction.childNodes).to.have.length(3);

        transaction.childNodes.forEach(row => {
            expect(row.tagName).to.equal('SPAN');
            expect(row.className).to.equal('row');
        });

        index++;
    });

    it.each(transactions, 'handle date input', () => {
        const onChange = sinon.spy();

        const { container } = render(<FormFieldTransactions
            value={value}
            onChange={onChange}
        />);

        const [ul] = container.childNodes;
        const li = ul.childNodes[index];
        const [transaction] = li.childNodes;

        const [dateRow] = transaction.childNodes;

        expect(dateRow.childNodes).to.have.length(2);
        const [dateLabelCol, dateInputCol] = dateRow.childNodes;

        expect(dateLabelCol.tagName).to.equal('SPAN');
        expect(dateLabelCol.className).to.equal('col');
        expect(dateLabelCol.innerHTML).to.equal('Date:');

        expect(dateInputCol.tagName).to.equal('SPAN');
        expect(dateInputCol.className).to.equal('col');
        expect(dateInputCol.childNodes).to.have.length(1);

        const { childNodes: [inputDate] } = dateInputCol.childNodes[0];

        fireEvent.change(inputDate, { target: { value: '2017-04-03' } });
        fireEvent.blur(inputDate);

        expect(onChange).to.have.been.calledWith(
            value.list,
            index,
            DateTime.fromISO('2017-04-03'),
            'date'
        );

        index++;
    });

    it.each(transactions, 'handle units input', () => {
        const onChange = sinon.spy();

        const { container } = render(<FormFieldTransactions
            value={value}
            onChange={onChange}
        />);

        const [ul] = container.childNodes;
        const li = ul.childNodes[index];
        const [transaction] = li.childNodes;

        const [, unitsRow] = transaction.childNodes;

        expect(unitsRow.childNodes).to.have.length(2);
        const [unitsLabelCol, unitsInputCol] = unitsRow.childNodes;

        expect(unitsLabelCol.tagName).to.equal('SPAN');
        expect(unitsLabelCol.className).to.equal('col');
        expect(unitsLabelCol.innerHTML).to.equal('Units:');

        expect(unitsInputCol.tagName).to.equal('SPAN');
        expect(unitsInputCol.className).to.equal('col');
        expect(unitsInputCol.childNodes).to.have.length(1);

        const { childNodes: [inputUnits] } = unitsInputCol.childNodes[0];

        fireEvent.change(inputUnits, { target: { value: '34.2219' } });
        fireEvent.blur(inputUnits);

        expect(onChange).to.have.been.calledWith(
            value.list,
            index,
            34.2219,
            'units'
        );

        index++;
    });

    it.each(transactions, 'handle cost input', () => {
        const onChange = sinon.spy();

        const { container } = render(<FormFieldTransactions
            value={value}
            onChange={onChange}
        />);

        const [ul] = container.childNodes;
        const li = ul.childNodes[index];
        const [transaction] = li.childNodes;

        const [, , costRow] = transaction.childNodes;

        expect(costRow.childNodes).to.have.length(2);
        const [costLabelCol, costInputCol] = costRow.childNodes;

        expect(costLabelCol.tagName).to.equal('SPAN');
        expect(costLabelCol.className).to.equal('col');
        expect(costLabelCol.innerHTML).to.equal('Cost:');

        expect(costInputCol.tagName).to.equal('SPAN');
        expect(costInputCol.className).to.equal('col');
        expect(costInputCol.childNodes).to.have.length(1);

        const { childNodes: [inputcost] } = costInputCol.childNodes[0];

        fireEvent.change(inputcost, { target: { value: '126.7692' } });
        fireEvent.blur(inputcost);

        expect(onChange).to.have.been.calledWith(
            value.list,
            index,
            12677,
            'cost'
        );

        index++;
    });
});

