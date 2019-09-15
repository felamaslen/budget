import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';
import { createMockStore } from 'redux-test-utils';
import { DateTime } from 'luxon';
import GraphOverview from '~client/containers/GraphOverview';
import { testState } from '~client-test/test_data/state';

const getContainer = memoize((customProps = {}) => {
    const props = {
        ...customProps,
    };

    const state = {
        ...testState,
        now: DateTime.fromISO('2018-03-02T12:36:49Z'),
        app: {
            ...testState.app,
            windowWidth: 1045,
        },
    };

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <GraphOverview {...props} />
        </Provider>,
    );

    return { store, ...utils };
});

test('rendering a graph container', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'graph-container-outer');
    t.is(div.childNodes.length, 2);
});

test('rendering a balance graph', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [graphBalance] = div.childNodes;

    t.is(graphBalance.tagName, 'DIV');
    t.is(graphBalance.className, 'graph-container graph-balance');
});

test('rendering a spending graph', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, graphSpending] = div.childNodes;

    t.is(graphSpending.tagName, 'DIV');
    t.is(graphSpending.className, 'graph-container graph-spend');
});
