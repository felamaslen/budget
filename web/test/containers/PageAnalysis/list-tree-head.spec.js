import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import reduction from '~client/reduction';
import ListTreeHead from '~client/containers/PageAnalysis/list-tree-head';

const getContainer = memoize((customProps = {}) => {
    const props = {
        items: [
            { name: 'foo', itemCost: 3, pct: 5, open: false, visible: true },
            { name: 'bar', itemCost: 5, pct: 8, open: false, visible: true },
            { name: 'baz', itemCost: 1, pct: 2, open: false, visible: false }
        ],
        ...customProps
    };

    const state = reduction;

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <ListTreeHead {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;
    t.is(li.tagName, 'LI');
    t.is(li.className, 'tree-list-item head');
    t.is(li.childNodes.length, 1);

    const [inner] = li.childNodes;
    t.is(inner.tagName, 'DIV');
    t.is(inner.className, 'inner');
    t.is(inner.childNodes.length, 4);
});

test('indicator', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;
    const [inner] = li.childNodes;

    const [indicator] = inner.childNodes;

    t.is(indicator.tagName, 'SPAN');
    t.is(indicator.className, 'indicator');
    t.is(indicator.childNodes.length, 0);
});

test('title', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;
    const [inner] = li.childNodes;

    const [, title] = inner.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.className, 'title');
    t.is(title.innerHTML, 'Total:');
});

test('total cost', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;
    const [inner] = li.childNodes;

    const [, , span] = inner.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'cost');
    t.is(span.childNodes.length, 2);

    const [total, selected] = span.childNodes;

    t.is(total.tagName, 'DIV');
    t.is(total.className, 'total');
    t.is(total.innerHTML, '£0.09');

    t.is(selected.tagName, 'DIV');
    t.is(selected.className, 'selected');
    t.is(selected.innerHTML, '£0.08');
});

test('total percent', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;
    const [inner] = li.childNodes;

    const [, , , span] = inner.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'pct');
    t.is(span.childNodes.length, 2);

    const [total, selected] = span.childNodes;

    t.is(total.tagName, 'DIV');
    t.is(total.className, 'total');
    t.is(total.innerHTML, '15.0%');

    t.is(selected.tagName, 'DIV');
    t.is(selected.className, 'selected');
    t.is(selected.innerHTML, '13.0%');
});
