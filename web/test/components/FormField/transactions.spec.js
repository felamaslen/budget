import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import { DateTime } from 'luxon';
import FormFieldTransactions from '~client/components/FormField/transactions';
import { TransactionsList } from '~client/modules/data';

const transactions = [
    { date: '2017-11-10', units: 10.5, cost: 50 },
    { date: '2018-09-05', units: -3, cost: -40 }
];

const value = new TransactionsList(transactions);

const getContainer = (customProps = {}) => {
    const props = {
        value,
        onChange: () => null,
        ...customProps
    };

    return render(<FormFieldTransactions {...props} />);
};

test('basic structure', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange });

    t.is(container.childNodes.length, 1);
    const [ul] = container.childNodes;

    t.is(ul.tagName, 'UL');
    t.is(ul.className, 'transactions-list');

    t.is(ul.childNodes.length, 2);
});

test('rendering a list of transactions', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange });

    const [ul] = container.childNodes;

    transactions.forEach((transaction, index) => {
        const li = ul.childNodes[index];

        t.is(li.tagName, 'LI');
        t.is(li.childNodes.length, 1);

        const [item] = li.childNodes;

        t.is(item.tagName, 'SPAN');
        t.is(item.childNodes.length, 3);

        item.childNodes.forEach(row => {
            t.is(row.tagName, 'SPAN');
            t.is(row.className, 'row');
        });
    });
});

test('handling date input', t => {
    transactions.forEach((transaction, index) => {
        const onChange = t.context.stub();
        const { container } = getContainer({ onChange });

        const [ul] = container.childNodes;

        const li = ul.childNodes[index];
        const [item] = li.childNodes;

        const [dateRow] = item.childNodes;

        t.is(dateRow.childNodes.length, 2);
        const [dateLabelCol, dateInputCol] = dateRow.childNodes;

        t.is(dateLabelCol.tagName, 'SPAN');
        t.is(dateLabelCol.className, 'col');
        t.is(dateLabelCol.innerHTML, 'Date:');

        t.is(dateInputCol.tagName, 'SPAN');
        t.is(dateInputCol.className, 'col');
        t.is(dateInputCol.childNodes.length, 1);

        const { childNodes: [inputDate] } = dateInputCol.childNodes[0];

        t.is(onChange.calls.length, 0);

        fireEvent.change(inputDate, { target: { value: '2017-04-03' } });
        t.is(onChange.calls.length, 0);

        fireEvent.blur(inputDate);

        t.is(onChange.calls.length, 1);
        t.deepEqual(onChange.calls[0].arguments, [
            value.list,
            index,
            DateTime.fromISO('2017-04-03'),
            'date'
        ]);
    });
});

test('handling units input', t => {
    transactions.forEach((transaction, index) => {
        const onChange = t.context.stub();
        const { container } = getContainer({ onChange });

        const [ul] = container.childNodes;

        const li = ul.childNodes[index];
        const [item] = li.childNodes;

        const [, unitsRow] = item.childNodes;

        t.is(unitsRow.childNodes.length, 2);
        const [unitsLabelCol, unitsInputCol] = unitsRow.childNodes;

        t.is(unitsLabelCol.tagName, 'SPAN');
        t.is(unitsLabelCol.className, 'col');
        t.is(unitsLabelCol.innerHTML, 'Units:');

        t.is(unitsInputCol.tagName, 'SPAN');
        t.is(unitsInputCol.className, 'col');
        t.is(unitsInputCol.childNodes.length, 1);

        const { childNodes: [inputUnits] } = unitsInputCol.childNodes[0];

        t.is(onChange.calls.length, 0);

        fireEvent.change(inputUnits, { target: { value: '34.2219' } });
        t.is(onChange.calls.length, 0);

        fireEvent.blur(inputUnits);

        t.is(onChange.calls.length, 1);

        t.deepEqual(onChange.calls[0].arguments, [
            value.list,
            index,
            34.2219,
            'units'
        ]);
    });
});

test('handling cost input', t => {
    transactions.forEach((transaction, index) => {
        const onChange = t.context.stub();
        const { container } = getContainer({ onChange });

        const [ul] = container.childNodes;

        const li = ul.childNodes[index];
        const [item] = li.childNodes;

        const [, , costRow] = item.childNodes;

        t.is(costRow.childNodes.length, 2);
        const [costLabelCol, costInputCol] = costRow.childNodes;

        t.is(costLabelCol.tagName, 'SPAN');
        t.is(costLabelCol.className, 'col');
        t.is(costLabelCol.innerHTML, 'Cost:');

        t.is(costInputCol.tagName, 'SPAN');
        t.is(costInputCol.className, 'col');
        t.is(costInputCol.childNodes.length, 1);

        const { childNodes: [inputCost] } = costInputCol.childNodes[0];

        t.is(onChange.calls.length, 0);

        fireEvent.change(inputCost, { target: { value: '126.7692' } });
        t.is(onChange.calls.length, 0);

        fireEvent.blur(inputCost);

        t.is(onChange.calls.length, 1);

        t.deepEqual(onChange.calls[0].arguments, [
            value.list,
            index,
            12677,
            'cost'
        ]);
    });
});

