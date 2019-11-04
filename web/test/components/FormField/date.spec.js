import ava from 'ava';
import sinon from 'sinon';
import ninos from 'ninos';

import '~client-test/browser';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DateTime } from 'luxon';

import FormFieldDate from '~client/components/FormField/date';

const test = ninos(ava);

const getContainer = (customProps = {}, ...args) => {
    const props = {
        active: true,
        value: DateTime.fromISO('2017-11-10'),
        onChange: () => null,
        ...customProps,
    };

    return render(<FormFieldDate {...props} />, ...args);
};

test('basic structure', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');

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
    const onType = t.context.stub();
    const { container } = getContainer({ onChange, onType });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(onChange.calls.length, 0);

    fireEvent.change(input, { target: { value: '2014-04-09' } });
    t.is(onChange.calls.length, 0);

    fireEvent.blur(input);
    t.is(onChange.calls.length, 1);
    t.deepEqual(onChange.calls[0].arguments, [DateTime.fromISO('2014-04-09')]);
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

test('rendering as a string input - entering abbreviations', t => {
    const clock = sinon.useFakeTimers(
        new Date('2019-07-06T16:47:20Z').getTime(),
    );

    const onChange = t.context.stub();
    const props = { onChange, string: true };

    const { container } = getContainer(props);

    const {
        childNodes: [input],
    } = container.childNodes[0];

    t.is(input.type, 'text');

    fireEvent.change(input, { target: { value: '1' } });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.deepEqual(onChange.calls[0].arguments, [DateTime.fromISO('2019-07-01')]);

    act(() => {
        getContainer({ ...props, active: true }, { container });
    });
    fireEvent.change(container.childNodes[0].childNodes[0], {
        target: { value: '4/3' },
    });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.deepEqual(onChange.calls[1].arguments, [DateTime.fromISO('2019-03-04')]);

    act(() => {
        getContainer({ ...props, active: true }, { container });
    });
    fireEvent.change(container.childNodes[0].childNodes[0], {
        target: { value: '2/9/16' },
    });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.deepEqual(onChange.calls[2].arguments, [DateTime.fromISO('2016-09-02')]);

    act(() => {
        getContainer({ ...props, active: true }, { container });
    });
    fireEvent.change(container.childNodes[0].childNodes[0], {
        target: { value: '2/9/2016' },
    });
    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.deepEqual(onChange.calls[3].arguments, [DateTime.fromISO('2016-09-02')]);

    clock.restore();
});

test('rendering as a string input - handling invalid input', t => {
    const onChange = t.context.stub();
    const props = { onChange, active: true, string: true };
    const { container } = getContainer(props);

    const {
        childNodes: [input],
    } = container.childNodes[0];

    t.is(input.type, 'text');

    fireEvent.change(input, { target: { value: 'not-a-date' } });

    act(() => {
        getContainer({ ...props, active: false }, { container });
    });

    t.is(onChange.calls.length, 0);
});
