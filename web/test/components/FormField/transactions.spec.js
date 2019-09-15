import ava from 'ava';
import ninos from 'ninos';

import '~client-test/browser';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import FormFieldTransactions from '~client/components/FormField/transactions';
import { getTransactionsList, modifyTransaction, removeAtIndex } from '~client/modules/data';

const test = ninos(ava);

const transactions = [
    { date: '2017-11-10', units: 10.5, cost: 50 },
    { date: '2018-09-05', units: -3, cost: -40 },
];

const value = getTransactionsList(transactions);

const getContainer = (customProps = {}, ...args) => {
    const props = {
        value,
        onChange: () => null,
        ...customProps,
    };

    return render(<FormFieldTransactions {...props} />, ...args);
};

test('basic structure (inactive)', (t) => {
    const { container } = getContainer({ active: false });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;

    t.is(span.tagName, 'DIV');
    t.is(span.className, 'form-field form-field-transactions');
    t.is(span.innerHTML, '2'); // two transactions
});

test('basic structure (active)', (t) => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange, active: true, create: true });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;

    t.is(span.childNodes.length, 2);

    const [overview, modal] = span.childNodes;

    t.is(overview.innerHTML, '2');

    t.is(modal.tagName, 'DIV');
    t.is(modal.className, 'modal');
    t.is(modal.childNodes.length, 1);

    const [inner] = modal.childNodes;
    t.is(inner.tagName, 'DIV');
    t.is(inner.className, 'modal-inner');
    t.is(inner.childNodes.length, 2);

    const [head, ul] = inner.childNodes;

    t.is(head.tagName, 'DIV');
    t.is(head.className, 'modal-head');
    t.is(head.childNodes.length, 3);

    const [date, units, cost] = head.childNodes;

    t.is(date.innerHTML, 'Date');
    t.is(units.innerHTML, 'Units');
    t.is(cost.innerHTML, 'Cost');

    t.is(ul.tagName, 'UL');
    t.is(ul.className, 'transactions-list');
});

test('rendering a list of transactions', (t) => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange, active: true, create: true });
    const { childNodes: [, modal] } = container.childNodes[0];
    const { childNodes: [, ul] } = modal.childNodes[0];

    t.is(ul.childNodes.length, transactions.length + 1); // transactions + create item

    transactions.forEach((transaction, index) => {
        const li = ul.childNodes[index + 1];

        t.is(li.tagName, 'LI');
        t.is(li.childNodes.length, 4);

        const [date, units, cost, button] = li.childNodes;

        t.is(date.tagName, 'SPAN');
        t.is(units.tagName, 'SPAN');
        t.is(cost.tagName, 'SPAN');
        t.is(button.tagName, 'SPAN');

        t.is(date.className, 'row date');
        t.is(units.className, 'row units');
        t.is(cost.className, 'row cost');
        t.is(button.className, 'row button');
    });
});

test('handling date input', (t) => {
    transactions.forEach((transaction, index) => {
        const onChange = t.context.stub();
        const { container } = getContainer({ onChange, active: true, create: true });
        const { childNodes: [, modal] } = container.childNodes[0];
        const { childNodes: [, ul] } = modal.childNodes[0];

        const li = ul.childNodes[index + 1];
        const [item] = li.childNodes;

        t.is(item.childNodes.length, 2);
        const [dateLabelCol, dateInputCol] = item.childNodes;

        t.is(dateLabelCol.tagName, 'SPAN');
        t.is(dateLabelCol.className, 'col label');
        t.is(dateLabelCol.innerHTML, 'Date:');

        t.is(dateInputCol.tagName, 'SPAN');
        t.is(dateInputCol.className, 'col');
        t.is(dateInputCol.childNodes.length, 1);

        const { childNodes: [inputDate] } = dateInputCol.childNodes[0];
        t.is(inputDate.tagName, 'INPUT');

        t.is(onChange.calls.length, 0);

        fireEvent.change(inputDate, { target: { value: '2017-04-03' } });
        t.is(onChange.calls.length, 0);

        fireEvent.blur(inputDate);
        t.is(onChange.calls.length, 0);

        act(() => {
            getContainer({ onChange, active: false, create: true }, { container });
        });

        t.is(onChange.calls.length, 1);
        t.deepEqual(onChange.calls[0].arguments, [modifyTransaction(value, index, {
            date: '2017-04-03',
        })]);
    });
});

test('handling units input', (t) => {
    transactions.forEach((transaction, index) => {
        const onChange = t.context.stub();
        const { container } = getContainer({ onChange, active: true, create: true });
        const { childNodes: [, modal] } = container.childNodes[0];
        const { childNodes: [, ul] } = modal.childNodes[0];

        const li = ul.childNodes[index + 1];
        const [, item] = li.childNodes;

        t.is(item.childNodes.length, 2);
        const [unitsLabelCol, unitsInputCol] = item.childNodes;

        t.is(unitsLabelCol.tagName, 'SPAN');
        t.is(unitsLabelCol.className, 'col label');
        t.is(unitsLabelCol.innerHTML, 'Units:');

        t.is(unitsInputCol.tagName, 'SPAN');
        t.is(unitsInputCol.className, 'col');
        t.is(unitsInputCol.childNodes.length, 1);

        const { childNodes: [inputUnits] } = unitsInputCol.childNodes[0];
        t.is(inputUnits.tagName, 'INPUT');

        t.is(onChange.calls.length, 0);

        fireEvent.change(inputUnits, { target: { value: '34.2219' } });
        t.is(onChange.calls.length, 0);

        fireEvent.blur(inputUnits);
        t.is(onChange.calls.length, 0);

        act(() => {
            getContainer({ onChange, active: false, create: true }, { container });
        });

        t.is(onChange.calls.length, 1);
        t.deepEqual(onChange.calls[0].arguments, [modifyTransaction(value, index, {
            units: 34.2219,
        })]);
    });
});

test('handling cost input', (t) => {
    transactions.forEach((transaction, index) => {
        const onChange = t.context.stub();
        const { container } = getContainer({ onChange, active: true, create: true });
        const { childNodes: [, modal] } = container.childNodes[0];
        const { childNodes: [, ul] } = modal.childNodes[0];

        const li = ul.childNodes[index + 1];
        const [, , item] = li.childNodes;

        t.is(item.childNodes.length, 2);
        const [costLabelCol, costInputCol] = item.childNodes;

        t.is(costLabelCol.tagName, 'SPAN');
        t.is(costLabelCol.className, 'col label');
        t.is(costLabelCol.innerHTML, 'Cost:');

        t.is(costInputCol.tagName, 'SPAN');
        t.is(costInputCol.className, 'col');
        t.is(costInputCol.childNodes.length, 1);

        const { childNodes: [inputCost] } = costInputCol.childNodes[0];
        t.is(inputCost.tagName, 'INPUT');

        t.is(onChange.calls.length, 0);

        fireEvent.change(inputCost, { target: { value: '126.7692' } });
        t.is(onChange.calls.length, 0);

        fireEvent.blur(inputCost);
        t.is(onChange.calls.length, 0);

        act(() => {
            getContainer({ onChange, active: false, create: true }, { container });
        });

        t.is(onChange.calls.length, 1);
        t.deepEqual(onChange.calls[0].arguments, [modifyTransaction(value, index, {
            cost: 12677,
        })]);
    });
});

// eslint-disable-next-line max-statements
test('adding a transaction', (t) => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange, active: true, create: true });
    const { childNodes: [, modal] } = container.childNodes[0];
    const { childNodes: [, ul] } = modal.childNodes[0];

    t.is(ul.childNodes.length, 3);
    const [liAdd] = ul.childNodes;

    const [rowDate, rowUnits, rowCost, rowAdd] = liAdd.childNodes;

    t.is(rowDate.className, 'row date');
    t.is(rowUnits.className, 'row units');
    t.is(rowCost.className, 'row cost');

    const { childNodes: [fieldDate] } = rowDate.childNodes[1];
    const { childNodes: [fieldUnits] } = rowUnits.childNodes[1];
    const { childNodes: [fieldCost] } = rowCost.childNodes[1];

    const [inputDate] = fieldDate.childNodes;
    const [inputUnits] = fieldUnits.childNodes;
    const [inputCost] = fieldCost.childNodes;

    const [buttonAdd] = rowAdd.childNodes;

    t.is(onChange.calls.length, 0);

    fireEvent.change(inputDate, { target: { value: '2019-02-11' } });
    fireEvent.blur(inputDate);
    t.is(onChange.calls.length, 0);

    fireEvent.change(inputUnits, { target: { value: '562.23' } });
    fireEvent.blur(inputUnits);
    t.is(onChange.calls.length, 0);

    fireEvent.change(inputCost, { target: { value: '1095.91' } });
    fireEvent.blur(inputCost);
    t.is(onChange.calls.length, 0);

    fireEvent.click(buttonAdd);
    t.is(onChange.calls.length, 0);

    act(() => {
        getContainer({ onChange, active: false, create: true }, { container });
    });

    t.is(onChange.calls[0].arguments.length, 1);
    const [newValue] = onChange.calls[0].arguments;

    t.deepEqual(newValue.slice(0, 2), value);

    const { id, ...rest } = newValue[2];
    t.true(typeof id === 'string');
    t.true(id.length >= 7);

    const [{ id: discard, ...contrived }] = getTransactionsList([{
        date: '2019-02-11',
        units: 562.23,
        cost: 109591,
    }]);

    t.deepEqual(rest, contrived);
});

test('removing a transaction', (t) => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange, active: true, create: true });
    const { childNodes: [, modal] } = container.childNodes[0];
    const { childNodes: [, ul] } = modal.childNodes[0];

    t.is(ul.childNodes.length, 3);
    const [, row1, row2] = ul.childNodes;

    const [, , , rowRemove1] = row1.childNodes;
    const [, , , rowRemove2] = row2.childNodes;

    const [buttonRemove1] = rowRemove1.childNodes;
    const [buttonRemove2] = rowRemove2.childNodes;

    t.is(buttonRemove1.tagName, 'BUTTON');
    t.is(buttonRemove2.tagName, 'BUTTON');

    t.is(buttonRemove1.innerHTML, '−');
    t.is(buttonRemove2.innerHTML, '−');

    t.is(onChange.calls.length, 0);

    fireEvent.click(buttonRemove1);
    t.is(onChange.calls.length, 0);

    act(() => {
        getContainer({ onChange, active: false, create: true }, { container });
    });

    t.is(onChange.calls.length, 1);
    t.deepEqual(onChange.calls[0].arguments, [removeAtIndex(value, 0)]);
});
