import ava from 'ava';
import sinon from 'sinon';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { DateTime } from 'luxon';

import FormFieldDate from '~client/components/FormField/date';

const getContainer = (customProps = {}) => {
    const props = {
        value: DateTime.fromISO('2017-11-10'),
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
    const clock = sinon.useFakeTimers(new Date('2019-07-06T16:47:20Z').getTime());

    const onChange = t.context.stub();
    const { container } = getContainer({ onChange, string: true });

    const { childNodes: [input] } = container.childNodes[0];

    t.is(input.type, 'text');

    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.blur(input);

    t.deepEqual(onChange.calls[0].arguments, [DateTime.fromISO('2019-07-01')]);

    fireEvent.change(input, { target: { value: '4/3' } });
    fireEvent.blur(input);

    t.deepEqual(onChange.calls[1].arguments, [DateTime.fromISO('2019-03-04')]);

    fireEvent.change(input, { target: { value: '2/9/16' } });
    fireEvent.blur(input);

    t.deepEqual(onChange.calls[2].arguments, [DateTime.fromISO('2016-09-02')]);

    clock.restore();
});

test('rendering as a string input - handling invalid input', t => {
    const onChange = t.context.stub();
    const { container } = getContainer({ onChange, string: true });

    const { childNodes: [input] } = container.childNodes[0];

    t.is(input.type, 'text');

    fireEvent.change(input, { target: { value: 'not-a-date' } });
    fireEvent.blur(input);

    t.deepEqual(onChange.calls[0].arguments, [DateTime.fromISO('2017-11-10')]);
});
