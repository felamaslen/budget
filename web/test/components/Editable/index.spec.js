import test from 'ava';
import '~client-test/browser';
import { render } from '@testing-library/react';
import React from 'react';
import Editable from '~client/components/Editable';

const getContainer = (customProps = {}) => {
    const props = {
        onType: () => null,
        onChange: () => null,
        suggestions: {
            list: [],
            active: null,
            next: []
        },
        ...customProps
    };

    return render(<Editable {...props} />);
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

test('Falsy transactions are rendered as 0 items', t => {
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

    const [editable] = span.childNodes;
    t.is(editable.tagName, 'SPAN');
    t.is(editable.className, 'editable-inner');
    t.is(editable.childNodes.length, 1);

    const [value] = editable.childNodes;
    t.is(value.tagName, 'SPAN');
    t.is(value.className, 'num-transactions');
    t.is(value.innerHTML, '0');
});
