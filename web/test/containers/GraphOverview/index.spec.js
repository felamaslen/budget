import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { Provider } from 'react-redux';
import React from 'react';
import { createMockStore } from 'redux-test-utils';
import { DateTime } from 'luxon';
import GraphOverview from '~client/containers/GraphOverview';
import { testState } from '~client-test/test_data/state';

const getContainer = memoize((customProps = {}) => {
    const props = {
        ...customProps
    };

    const state = {
        ...testState,
        now: DateTime.fromISO('2018-03-02T12:36:49Z'),
        app: {
            ...testState.app,
            windowWidth: 1045
        },
        overview: {
            ...testState.overview,
            startDate: DateTime.fromObject({ year: 2018, month: 2, day: 28 }),
            endDate: DateTime.fromObject({ year: 2018, month: 5, day: 31 }),
            cost: {
                funds: [983204, 983204, 983204, 983204, 983204, 983204, 983204, 983204],
                fundChanges: [0, 0, 0, 0, 0, 0, 0, 0],
                income: [163613, 163613, 163613, 163613, 163613, 0, 0],
                bills: [101992, 101992, 101992, 101992, 98106, 97356, 0, 0],
                food: [26247, 22075, 23260, 11979, 11933, 1186, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                general: [59288, 12542, 9737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                holiday: [17820, 33019, 52100, 112722, 0, 46352, 9880, 0, 0, 0, 0, 0, 0],
                social: [5440, 4560, 900, 4370, 2545, 700, 2491, 0, 0, 0, 0, 0, 0, 0],
                balance: [1242000, 1830000, 1860000, 1890000, 1980000, 2000000, 0, 0, 0],
                old: [488973, 332654, 247359, 208390, 156520, 839480, 641599, 543787, 556649, 649386],
                net: [100, -10, 125, 160, 14, 145, 96, 76, 1],
                spending: [143, 1032, 56891, 1923, 99130, 10, 1104, 9914, 8247]
            },
            rows: [
                [1654],
                [1872],
                [932],
                [9931]
            ],
            data: {
                numRows: 4,
                numCols: 1
            }
        }
    };

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <GraphOverview {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('rendering a graph container', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'graph-container-outer');
    t.is(div.childNodes.length, 2);
});

test('rendering a balance graph', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [graphBalance] = div.childNodes;

    t.is(graphBalance.tagName, 'DIV');
    t.is(graphBalance.className, 'graph-container graph-balance');
});

test('rendering a spending graph', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, graphSpending] = div.childNodes;

    t.is(graphSpending.tagName, 'DIV');
    t.is(graphSpending.className, 'graph-container graph-spend');
});
