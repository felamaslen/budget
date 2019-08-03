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

const getContainer = (customProps = {}, customState = state => state, ...args) => {
    const state = customState({
        ...testState
    });

    const store = createMockStore(state);

    const props = {
        enabled: true,
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <StocksList {...props} />
        </Provider>,
        ...args
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'stocks-list');
    t.is(div.childNodes.length, 1);
});

test('requesting a stocks list when it renders', t => {
    const clock = sinon.useFakeTimers();

    const { store } = getContainer();

    const action = stocksListRequested();

    t.false(store.isActionDispatched(action));

    clock.tick(1);

    t.true(store.isActionDispatched(action));

    clock.restore();
});

test('rendering a stocks list', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [stocksList] = div.childNodes;

    t.is(stocksList.tagName, 'UL');
    t.is(stocksList.className, 'stocks-list-ul');
    t.is(stocksList.childNodes.length, 4);
});

test('rendering CTY stock', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [stocksList] = div.childNodes;

    const [cty] = stocksList.childNodes;

    t.is(cty.tagName, 'LI');
    t.is(cty.className, 'stocks-list-item stocks-list-share');
    t.is(cty.title, 'City of London Investment Trust');
    t.is(cty.childNodes[0].innerHTML, 'CTY.L');
});

test('rendering SMT stock', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [stocksList] = div.childNodes;

    const [, smt] = stocksList.childNodes;

    t.is(smt.tagName, 'LI');
    t.is(smt.className, 'down hl-up');
    t.is(smt.title, 'Scottish Mortgage Investment Trust');

    t.is(smt.childNodes.[0].innerHTML, 'SMT.L');
});

test('rendering SPX index', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [stocksList] = div.childNodes;

    const [, , spx] = stocksList.childNodes;

    t.is(spx.tagName, 'LI');
    t.is(spx.className, '');
    t.not(spx.title, 'S&P 500');

    t.is(spx.childNodes.[0].innerHTML, 'S&P 500');
});

test('rendering FTSE index', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;
    const [stocksList] = div.childNodes;

    const [, , , ftse] = stocksList.childNodes;

    t.is(ftse.tagName, 'LI');
    t.is(ftse.className, '');
    t.not(ftse.title, 'FTSE 100');

    t.is(ftse.childNodes.[0].innerHTML, 'FTSE 100');
});
