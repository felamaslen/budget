import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import ModalDialogField from '~client/components/FormField/modal-dialog-field';
import { getTransactionsList } from '~client/modules/data';

const getModalDialogField = memoize((customProps = {}) => {
    const props = {
        fieldKey: 3,
        field: {
            item: 'foo',
            value: 'bar'
        },
        invalidKeys: [],
        onChange: () => null,
        ...customProps
    };

    return render(
        <ModalDialogField {...props} />
    );
});

test('basic structure', t => {
    const { container } = getModalDialogField();

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;
    t.is(li.tagName, 'LI');
    t.is(li.className, 'form-row foo');
    t.is(li.childNodes.length, 2);
});

test('label', t => {
    const { container } = getModalDialogField();
    const [li] = container.childNodes;

    const [label] = li.childNodes;
    t.is(label.tagName, 'SPAN');
    t.is(label.className, 'form-label');
    t.is(label.innerHTML, 'foo');
});

test('form field container', t => {
    const { container } = getModalDialogField();
    const [li] = container.childNodes;

    const [, formField] = li.childNodes;

    t.is(formField.tagName, 'DIV');
    const [input] = formField.childNodes;
    t.is(input.tagName, 'INPUT');
});

test('invalid class', t => {
    const { container } = getModalDialogField({
        invalidKeys: [3]
    });

    const [li] = container.childNodes;

    t.is(li.className, 'form-row foo invalid');
});

test('transactions fields', t => {
    const { container } = getModalDialogField({
        field: {
            item: 'transactions',
            value: getTransactionsList([])
        }
    });

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;

    t.is(li.childNodes.length, 1);
    const [div] = li.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 2);
    t.is(div.className, 'inner');
});

test('firing onChange', t => {
    const onChange = t.context.stub();
    const { container } = getModalDialogField({ onChange });
    const [li] = container.childNodes;
    const [, formField] = li.childNodes;
    const [input] = formField.childNodes;

    t.is(onChange.calls.length, 0);

    fireEvent.change(input, { target: { value: 'hello' } });
    t.is(onChange.calls.length, 0);
    fireEvent.blur(input);
    t.is(onChange.calls.length, 1);

    t.deepEqual(onChange.calls[0].arguments, ['hello']);
});
