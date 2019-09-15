import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import FormFieldTickbox from '~client/components/FormField/tickbox';

const getContainer = (customProps = {}, ...args) => {
    const props = {
        item: 'my-tickbox',
        value: true,
        onChange: () => null,
        ...customProps,
    };

    return render(<FormFieldTickbox {...props} />, ...args);
};

test('basic structure', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'form-field form-field-my-tickbox');
    t.is(div.childNodes.length, 1);

    const [input] = div.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'checkbox');
    t.true(input.checked);
});

test('handling onchange', (t) => {
    const onChange = sinon.stub();
    const { container } = getContainer({ onChange });

    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(onChange.getCalls().length, 0);

    fireEvent.click(input);

    t.is(onChange.getCalls().length, 1);
    t.deepEqual(onChange.getCalls()[0].args, [false]);

    act(() => {
        getContainer({ value: false, onChange }, { container });
    });

    t.false(input.checked);
    fireEvent.click(input);

    t.is(onChange.getCalls().length, 2);
    t.deepEqual(onChange.getCalls()[1].args, [true]);

    act(() => {
        getContainer({ value: true, onChange }, { container });
    });
    t.true(input.checked);
});
