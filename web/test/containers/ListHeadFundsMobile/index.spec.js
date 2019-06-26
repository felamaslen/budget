import test from 'ava';
import memoize from 'fast-memoize';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import '~client-test/browser';

import { testState as state } from '~client-test/test_data/state';
import ListHeadFundsMobile from '~client/containers/ListHeadFundsMobile';
import { aFundsGraphPeriodChanged } from '~client/actions/graph.actions';

const getContainer = memoize(() => {
    const store = createMockStore(state);

    const { container } = render(
        <Provider store={store}>
            <ListHeadFundsMobile />
        </Provider>
    );

    return { store, container };
});

test('rendering basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'funds-info-inner');
    t.is(div.childNodes.length, 2);
});

test('meta', t => {
    const { container } = getContainer();

    const { childNodes: [meta] } = container.childNodes[0];

    t.is(meta.tagName, 'DIV');
    t.is(meta.className, 'gain loss');
    t.is(meta.childNodes.length, 4);
});

test('reloading prices on meta click', t => {
    const { store, container } = getContainer();

    const action = aFundsGraphPeriodChanged({ shortPeriod: 'period1', noCache: true });

    t.false(store.isActionDispatched(action));

    const { childNodes: [meta] } = container.childNodes[0];
    fireEvent.click(meta);
    t.true(store.isActionDispatched(action));
});

test('gain info', t => {
    const { container } = getContainer();

    const { childNodes: [meta] } = container.childNodes[0];
    const [gainInfo] = meta.childNodes;

    t.is(gainInfo.tagName, 'SPAN');
    t.is(gainInfo.innerHTML, 'Current value:');
});

test('value', t => {
    const { container } = getContainer();

    const { childNodes: [meta] } = container.childNodes[0];
    const [, value] = meta.childNodes;

    t.is(value.tagName, 'SPAN');
    t.is(value.className, 'value');
    t.is(value.innerHTML, '£3,990.98');
});

test('gain percent', t => {
    const { container } = getContainer();

    const { childNodes: [meta] } = container.childNodes[0];
    const [, , gainPct] = meta.childNodes;

    t.is(gainPct.tagName, 'SPAN');
    t.is(gainPct.className, 'gain-pct');
    t.is(gainPct.innerHTML, '(0.23%)');
});

test('cache age', t => {
    const { container } = getContainer();

    const { childNodes: [meta] } = container.childNodes[0];
    const [, , , cacheAge] = meta.childNodes;

    t.is(cacheAge.tagName, 'SPAN');
    t.is(cacheAge.className, 'cache-age');
    t.is(cacheAge.innerHTML, '(6 months, 3 weeks ago)');
});
