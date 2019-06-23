import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldText from '~client/components/FormField';

const getFormFieldText = memoize((customProps = {}) => {
    const props = {
        value: 'foo',
        onChange: () => null,
        ...customProps
    };

    return render(<FormFieldText {...props} />);
});

test('basic structure', t => {
    const { container } = getFormFieldText();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);
    t.is(div.className, 'form-field form-field-text');
});

test('input', t => {
    const { container } = getFormFieldText();
    const [div] = container.childNodes;

    const [input] = div.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'text');
    t.is(input.value, 'foo');
});

test('changing value', t => {
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
