import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import { DateTime } from 'luxon';
import { aFundsGraphPeriodChanged } from '~client/actions/graph.actions';
import { aFundsViewSoldToggled } from '~client/actions/content.actions';

import ListHeadFundsDesktop from '~client/containers/ListHeadFundsDesktop';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';

const getContainer = memoize((customProps = {}, customState = null) => {
    let state = fromJS({
        now: DateTime.fromISO('2017-09-01T20:01Z'),
        pages: {
            funds: {
                cache: {
                    year1: {
                        prices: testPrices,
                        startTime: testStartTime,
                        cacheTimes: testCacheTimes
                    }
                },
                rows: testRows
            }
        },
        other: {
            graphFunds: {
                period: 'year1'
            }
        }
    });

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        page: 'funds',
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <ListHeadFundsDesktop {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('gain span', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 2);

    const [gainSpan] = container.childNodes;
    t.is(gainSpan.tagName, 'SPAN');
    t.is(gainSpan.className, 'overall-gain loss');
    t.is(gainSpan.childNodes.length, 3);
});

test('gain class', t => {
    const { container } = getContainer({}, state => state
        .setIn(['pages', 'funds', 'cache', 'year1', 'prices', '10', 'values', 30], 430)
    );

    const [span] = container.childNodes;

    t.is(span.className, 'overall-gain profit');
});

test('gain info', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;

    const [gainInfo, gainValues, cacheAge] = span.childNodes;

    t.is(gainInfo.tagName, 'SPAN');
    t.is(gainInfo.className, 'value');
    t.is(gainInfo.innerHTML, '£3,990.98');

    t.is(gainValues.tagName, 'SPAN');
    t.is(gainValues.className, 'gain-values');
    t.is(gainValues.childNodes.length, 2);

    const [gainPct, gainAbs] = gainValues.childNodes;

    t.is(gainPct.tagName, 'SPAN');
    t.is(gainAbs.tagName, 'SPAN');

    t.is(gainPct.className, 'gain-pct');
    t.is(gainAbs.className, 'gain-abs');

    t.is(gainPct.innerHTML, '(0.23%)');
    t.is(gainAbs.innerHTML, '(£9.02)');

    t.is(cacheAge.tagName, 'SPAN');
    t.is(cacheAge.className, 'cache-age');
    t.is(cacheAge.innerHTML, '(3 hours ago)');
});

test('reloading fund prices on click', t => {
    const { store, container } = getContainer();

    const action = aFundsGraphPeriodChanged({ shortPeriod: 'year1', noCache: true });

    t.false(store.isActionDispatched(action));

    fireEvent.click(container.childNodes[0]);

    t.true(store.isActionDispatched(action));
});

test('view sold toggle', t => {
    const { store, container } = getContainer();

    const [, toggleViewSold] = container.childNodes;

    t.is(toggleViewSold.tagName, 'SPAN');
    t.is(toggleViewSold.className, 'toggle-view-sold');
    t.is(toggleViewSold.childNodes.length, 2);

    const [input, span] = toggleViewSold.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'checkbox');
    t.is(input.checked, false);

    t.is(span.tagName, 'SPAN');
    t.is(span.innerHTML, 'View sold');

    const action = aFundsViewSoldToggled();

    t.false(store.isActionDispatched(action));

    fireEvent.click(input);

    t.true(store.isActionDispatched(action));
});

