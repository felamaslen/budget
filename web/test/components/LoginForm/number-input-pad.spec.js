import ava from 'ava';
import ninos from 'ninos';

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';

import React from 'react';
import NumberInputPad from '~client/components/LoginForm/number-input-pad';

const test = ninos(ava);

const getContainer = memoize((customProps = {}) => {
    const props = {
        onInput: () => null,
        ...customProps,
    };

    return render(<NumberInputPad {...props} />);
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 4);
});

const testNumberInputRow = (t, row) => {
    t.is(row.tagName, 'DIV');
    t.is(row.childNodes.length, 3);

    row.childNodes.forEach(button => {
        t.is(button.tagName, 'BUTTON');
    });
};

const testDigits = (t, rowIndex, digits) => {
    const onInput = t.context.stub();
    const { container } = render(<NumberInputPad onInput={onInput} />);

    t.is(onInput.calls.length, 0);

    const [div] = container.childNodes;
    const row = div.childNodes[rowIndex];

    row.childNodes.forEach((digit, index) => {
        fireEvent.mouseDown(digit);
        t.is(onInput.calls.length, index + 1);
        t.deepEqual(onInput.calls[index].arguments, [digits[index]]);
    });
};

test('digits 1-3 (rendering)', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [row] = div.childNodes;

    testNumberInputRow(t, row);
});

test('digits 4-6 (rendering)', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, row] = div.childNodes;

    testNumberInputRow(t, row);
});

test('digits 7-9 (rendering)', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, row] = div.childNodes;

    testNumberInputRow(t, row);
});

test('digits 1-3 (handling)', t => {
    testDigits(t, 0, [1, 2, 3]);
});

test('digits 4-6 (handling)', t => {
    testDigits(t, 1, [4, 5, 6]);
});

test('digits 7-9 (handling)', t => {
    testDigits(t, 2, [7, 8, 9]);
});

test('digit 0 (rendering)', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , , row] = div.childNodes;
    t.is(row.tagName, 'DIV');
    t.is(row.childNodes.length, 1);

    const [button] = row.childNodes;

    t.is(button.tagName, 'BUTTON');
});

test('digit 0 (handling)', t => {
    const onInput = t.context.stub();
    const { container } = render(<NumberInputPad onInput={onInput} />);

    const [div] = container.childNodes;
    const [, , , row] = div.childNodes;
    const [button] = row.childNodes;

    t.is(onInput.calls.length, 0);
    fireEvent.mouseDown(button);
    t.is(onInput.calls.length, 1);
    t.deepEqual(onInput.calls[0].arguments, [0]);
});
