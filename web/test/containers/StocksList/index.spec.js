import test from 'ava';
import '~client-test/browser';
import sinon from 'sinon';
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import StocksList from '~client/containers/StocksList';
import { stocksListRequested } from '~client/actions/stocks';
import { testState } from '~client-test/test_data/state';

const getContainer = (customProps = {}, customState = (state) => state, ...args) => {
    const state = customState({
        ...testState,
        stocks: {
            ...testState.stocks,
            loading: false,
            indices: [
                {
                    code: 'SPX',
                    name: 'S&P 500',
                    gain: 0.65,
                    up: true,
                    down: false,
                },
                {
                    code: 'FTSE',
                    name: 'FTSE 100',
                    gain: -0.21,
                    up: false,
                    down: true,
                },
            ],
            shares: [
                {
                    code: 'CTY.L',
                    name: 'City of London Investment Trust',
                    weight: 0.3,
                    gain: 0.01,
                    price: 406.23,
                    up: false,
                    down: true,
                },
                {
                    code: 'SMT.L',
                    name: 'Scottish Mortgage Investment Trust',
                    weight: 0.7,
                    gain: -0.54,
                    price: 492.21,
                    up: false,
                    down: true,
                },
            ],
            history: [],
            lastPriceUpdate: 133,
        },
    });

    const store = createMockStore(state);

    const props = {
        enabled: true,
        ...customProps,
    };

    const utils = render(
        <Provider store={store}>
            <StocksList {...props} />
        </Provider>,
        ...args,
    );

    return { store, ...utils };
};

test('basic structure', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'stocks-list graph-container-outer');
    t.is(div.childNodes.length, 1);
});

test('requesting a stocks list when it renders', (t) => {
    const clock = sinon.useFakeTimers();

    const { store } = getContainer();

    const action = stocksListRequested();

    t.false(store.isActionDispatched(action));

    clock.tick(1);

    t.true(store.isActionDispatched(action));

    clock.restore();
});

test('rendering a graph container', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;

    t.is(graph.tagName, 'DIV');
    t.is(graph.className, 'graph-container');
    t.is(graph.childNodes.length, 2);
});

test('rendering a stocks list', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;
    const [stocksList] = graph.childNodes;

    t.is(stocksList.tagName, 'UL');
    t.is(stocksList.className, 'stocks-list-ul');
    t.is(stocksList.childNodes.length, 2);
});

test('rendering CTY stock', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;
    const [stocksList] = graph.childNodes;

    const [cty] = stocksList.childNodes;

    t.is(cty.tagName, 'LI');
    t.is(cty.className, 'up hl-down');
    t.is(cty.title, 'City of London Investment Trust');

    t.is(cty.childNodes.length, 3);
    cty.childNodes.forEach((tag) => {
        t.is(tag.tagName, 'SPAN');
    });

    const [nameColumn, price, change] = cty.childNodes;

    t.is(nameColumn.className, 'name-column');
    t.is(price.className, 'price');
    t.is(change.className, 'change');

    t.is(nameColumn.childNodes.length, 2);
    nameColumn.childNodes.forEach((tag) => {
        t.is(tag.tagName, 'SPAN');
    });
    const [code, title] = nameColumn.childNodes;

    t.is(code.className, 'code');
    t.is(code.innerHTML, 'CTY.L');

    t.is(title.className, 'title');
    t.is(title.innerHTML, 'City of London Investment Trust');

    t.is(price.className, 'price');
    t.is(price.innerHTML, '406.23');

    t.is(change.className, 'change');
    t.is(change.innerHTML, '0.01%');
});

test('rendering SMT stock', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;
    const [stocksList] = graph.childNodes;

    const [, smt] = stocksList.childNodes;

    t.is(smt.tagName, 'LI');
    t.is(smt.className, 'down hl-down');
    t.is(smt.title, 'Scottish Mortgage Investment Trust');

    t.is(smt.childNodes.length, 3);
    smt.childNodes.forEach((tag) => {
        t.is(tag.tagName, 'SPAN');
    });

    const [nameColumn, price, change] = smt.childNodes;

    t.is(nameColumn.className, 'name-column');
    t.is(price.className, 'price');
    t.is(change.className, 'change');

    t.is(nameColumn.childNodes.length, 2);
    nameColumn.childNodes.forEach((tag) => {
        t.is(tag.tagName, 'SPAN');
    });
    const [code, title] = nameColumn.childNodes;

    t.is(code.className, 'code');
    t.is(code.innerHTML, 'SMT.L');

    t.is(title.className, 'title');
    t.is(title.innerHTML, 'Scottish Mortgage Investment Trust');

    t.is(price.className, 'price');
    t.is(price.innerHTML, '492.21');

    t.is(change.className, 'change');
    t.is(change.innerHTML, '-0.54%');
});

test('rendering a stocks sidebar', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;

    const [, sidebar] = graph.childNodes;

    t.is(sidebar.tagName, 'DIV');
    t.is(sidebar.className, 'stocks-sidebar');
    t.is(sidebar.childNodes.length, 2);
});

test('rendering a stocks graph', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;

    const [, sidebar] = graph.childNodes;

    const [stocksGraph] = sidebar.childNodes;

    t.is(stocksGraph.tagName, 'DIV');
    t.is(stocksGraph.className, 'graph-container graph-graph-stocks');
});

test('rendering a sidebar list', (t) => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [graph] = div.childNodes;

    const [, sidebar] = graph.childNodes;

    const [, sidebarList] = sidebar.childNodes;

    t.is(sidebarList.tagName, 'UL');
    t.is(sidebarList.childNodes.length, 3);
});
