import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Editable from '~client/components/Editable';

const getContainer = (customProps = {}, ...args) => {
    const props = {
        page: 'some-page',
        onType: () => null,
        onChange: () => null,
        ...customProps
    };

    return render(<Editable {...props} />, ...args);
};

test('rendering active editable item', t => {
    const { container } = getContainer({
        active: true,
        item: 'shop',
        value: 'Tesco'
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'editable editable-shop editable-active');

    t.is(span.childNodes.length, 1);
    t.regex(span.childNodes[0].className, /form-field/);
});

test('rendering inactive editable item', t => {
    const { container } = getContainer({
        active: false,
        item: 'shop',
        value: 'Tesco'
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.notRegex(span.className, /editable-active/);
});

test('Undefined value is renderd as a blank string', t => {
    const { container } = getContainer({
        active: false,
        item: 'shop'
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    const [editable] = span.childNodes;
    t.is(editable.innerHTML, '');
});

test('Falsey transactions are rendered as 0 items', t => {
    const { container } = getContainer({
        active: false,
        item: 'transactions',
        value: null
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'editable editable-transactions editable-inactive');
    t.is(span.childNodes.length, 1);

    const [field] = span.childNodes;
    t.is(field.tagName, 'DIV');
    t.is(field.className, 'form-field form-field-transactions');
    t.is(field.innerHTML, '0');
});

test('onChange is called with the column and new value', t => {
    const onChange = sinon.spy();

    const props = {
        active: true,
        item: 'shop',
        value: 'Tesco',
        onChange
    };

    const { container } = getContainer(props);

    const [span] = container.childNodes;
    const [field] = span.childNodes;
    const [input] = field.childNodes;

    t.is(input.tagName, 'INPUT');

    t.false(onChange.calledOnce);
    fireEvent.change(input, { target: { value: 'Wilko' } });

    act(() => {
        getContainer({
            ...props,
            active: false
        }, { container });
    });

    t.true(onChange.calledOnce);
    t.true(onChange.calledWith('shop', 'Wilko'));
});
