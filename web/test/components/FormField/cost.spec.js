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

    t.is(onChange.calls.length, 0);

    const input = () => container.childNodes[0].childNodes[0];

    fireEvent.change(input(), { target: { value: '10.93' } });
    t.is(onChange.calls.length, 0);
    t.is(input().value, '10.93');

    fireEvent.blur(input());
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

test('rendering as a string input - decimal point', t => {
    const onChange = t.context.stub();
    const props = { onChange, value: '', string: true };
    const { container } = getContainer(props);

    const input = () => container.childNodes[0].childNodes[0];

    t.is(input().value, '');

    const testInputCharacter = (value, changeTo, nextValue = value) => {
        const numCalls = onChange.calls.length;

        fireEvent.change(input(), { target: { value } });

        t.is(input().value, nextValue);

        act(() => {
            getContainer({ ...props, active: false }, { container });
        });

        t.is(onChange.calls.length, numCalls + 1);
        t.deepEqual(onChange.calls[onChange.calls.length - 1].arguments, [changeTo]);

        act(() => {
            getContainer({ ...props, active: true }, { container });
        });
    };

    const testInput = (string, changeTo) => {
        const chars = string.split('');

        chars.forEach((value, index) =>
            testInputCharacter(string.substring(0, index + 1), changeTo[index]));
    };

    testInput('1.5', [100, 100, 150]);

    testInput('1.05', [100, 100, 100, 105]);

    testInputCharacter('1', 100);
    testInputCharacter('10', 1000);
    testInputCharacter('100', 10000);
    testInputCharacter('1005', 100500);
    testInputCharacter('1.005', 101, '1.005');

    testInputCharacter('.', 0);
    testInputCharacter('.3', 30, '.3');

    testInputCharacter('.', 0);
    testInputCharacter('.0', 0, '.0');
    testInputCharacter('.05', 5, '.05');
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

    t.is(onChange.calls.length, 0);
});

test('rendering as a string input - not overwriting on invalid input', t => {
    const onChange = t.context.stub();
    const props = { onChange, string: true };
    const { container } = getContainer(props);

    const input = () => container.childNodes[0].childNodes[0];

    fireEvent.change(input(), { target: { value: '1.5' } });
    fireEvent.change(input(), { target: { value: '1.5f' } });
    t.is(input().value, '1.5');
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.deepEqual(onChange.calls[0].arguments, [150]);
});
