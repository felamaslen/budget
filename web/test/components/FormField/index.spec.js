import ava from 'ava';
import ninos from 'ninos';

import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import FormFieldText from '~client/components/FormField';

const test = ninos(ava);

const getFormFieldText = (customProps = {}) => {
    const props = {
        value: 'foo',
        onChange: () => null,
        ...customProps,
    };

    return render(<FormFieldText {...props} />);
};

test('basic structure', (t) => {
    const { container } = getFormFieldText();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);
    t.is(div.className, 'form-field form-field-text');
});

test('input', (t) => {
    const { container } = getFormFieldText();
    const [div] = container.childNodes;

    const [input] = div.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'text');
    t.is(input.value, 'foo');
});

test('changing value', (t) => {
    const onChange = t.context.stub();
    const { container } = getFormFieldText({ onChange });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    fireEvent.change(input, { target: { value: 'bar' } });

    t.is(onChange.calls.length, 0);

    fireEvent.blur(input);

    t.is(onChange.calls.length, 1);
    t.deepEqual(onChange.calls[0].arguments, ['bar']);
});

test('handling onType', (t) => {
    const onType = t.context.stub();

    const { container } = getFormFieldText({ onType });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(onType.calls.length, 0);

    fireEvent.change(input, { target: { value: 'b' } });
    t.is(onType.calls.length, 1);
    t.deepEqual(onType.calls[0].arguments, ['b']);

    fireEvent.blur(input);

    t.is(onType.calls.length, 1);
});
