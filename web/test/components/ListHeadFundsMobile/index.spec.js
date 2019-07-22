import test from 'ava';
import sinon from 'sinon';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import '~client-test/browser';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import { testState } from '~client-test/test_data/state';

import ListHeadFundsMobile from '~client/components/ListHeadFundsMobile';

const getContainer = (customProps = {}) => {
    const props = {
        totalCost: 400000,
        cachedValue: {
            value: 399098,
            ageText: '6 months, 3 weeks ago'
        },
        onReloadPrices: () => null,
        ...customProps
    };

    const store = createMockStore(testState);

    const utils = render(<Provider store={store}>
        <ListHeadFundsMobile {...props} />
    </Provider>);

    return { ...utils, store };
};

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
    const onReloadPrices = sinon.spy();
    const { container } = getContainer({
        onReloadPrices
    });

    t.is(onReloadPrices.getCalls().length, 0);
    const { childNodes: [meta] } = container.childNodes[0];
    fireEvent.click(meta);
    t.is(onReloadPrices.getCalls().length, 1);
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
