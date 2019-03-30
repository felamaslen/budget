import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldDate from '~client/components/FormField/date';
import { dateInput } from '~client/helpers/date';

const getContainer = (customProps = {}) => {
    const props = {
        value: dateInput('10/11/2017'),
        onChange: () => null,
        ...customProps
    };

    return render(<FormFieldDate {...props} />);
};

test('basic structure', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');

    t.is(div.className, 'form-field form-field-date');

    t.is(div.childNodes.length, 1);
});

test('input', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'date');
    t.is(input.value, '2017-11-10');
});

test('handling onchange', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(onChange.calls.length, 0);

    fireEvent.change(input, { target: { value: '2014-04-09' } });
    t.is(onChange.calls.length, 0);

    fireEvent.blur(input);
    t.is(onChange.calls.length, 1);
    t.deepEqual(onChange.calls[0].arguments, [dateInput('9/4/2014')]);
});

test('handling bad values', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(onChange.calls.length, 0);

    fireEvent.change(input, { target: { value: 'not a date' } });
    t.is(onChange.calls.length, 0);

    fireEvent.blur(input);
    t.is(onChange.calls.length, 1);
    t.is(onChange.calls[0].arguments[0].toString(), 'Invalid DateTime');
});

