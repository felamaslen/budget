import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldCost from '~client/components/FormField/cost';

const getContainer = memoize((customProps = {}) => {
    const props = {
        value: 10345,
        onChange: () => null,
        ...customProps
    };

    return render(<FormFieldCost {...props} />);
});

test('basic structure', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'form-field form-field-cost');
    t.is(div.childNodes.length, 1);
});

test('input', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'number');
    t.is(input.step, '0.01');
    t.is(input.value, '103.45');
});

test('handling onchange', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({
        onChange
    });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(onChange.calls.length, 0);

    fireEvent.change(input, { target: { value: '10.93' } });
    t.is(onChange.calls.length, 0);

    fireEvent.blur(input);
    t.is(onChange.calls.length, 1);

    t.deepEqual(onChange.calls[0].arguments, [1093]);
});

