import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldNumber from '~client/components/FormField/number';

const getContainer = memoize((customProps = {}) => {
    const props = {
        value: 103,
        onChange: () => null,
        ...customProps
    };

    return render(<FormFieldNumber {...props} />);
});

test('render its basic structure', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'form-field form-field-number');
    t.is(div.childNodes.length, 1);
});

test('render an input', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'number');
    t.is(input.value, '103');
});

test('fire onChange', t => {
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
    t.deepEqual(onChange.calls[0].arguments, [10.93]);
});

