import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import FormFieldCost from '~client/components/FormField/cost';

const getContainer = (customProps = {}, ...args) => {
    const props = {
        active: true,
        value: 10345,
        onChange: () => null,
        ...customProps
    };

    return render(<FormFieldCost {...props} />, ...args);
};

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

test('rendering as a string input', t => {
    const onChange = t.context.stub();
    const props = { onChange, string: true };
    const { container } = getContainer(props);

    const { childNodes: [input] } = container.childNodes[0];

    t.is(input.type, 'text');

    fireEvent.change(input, { target: { value: '10.93' } });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });
    t.deepEqual(onChange.calls[0].arguments, [1093]);

    act(() => {
        getContainer({ ...props, active: true }, { container });
    });
    fireEvent.change(container.childNodes[0].childNodes[0], { target: { value: '229.119330' } });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });
    t.deepEqual(onChange.calls[1].arguments, [22912]);
});

test('rendering as a string input - handling invalid input', t => {
    const onChange = t.context.stub();
    const props = { onChange, string: true };
    const { container } = getContainer(props);

    const { childNodes: [input] } = container.childNodes[0];

    t.is(input.type, 'text');

    fireEvent.change(input, { target: { value: 'not-a-number' } });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.deepEqual(onChange.calls[0].arguments, [0]);
});
