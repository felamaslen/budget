import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import ListHeadFundsDesktop from '~client/components/ListHeadFundsDesktop';

const getContainer = (customProps = {}) => {
    const props = {
        totalCost: 400000,
        viewSoldFunds: false,
        period: 'year1',
        cachedValue: {
            ageText: '3 hours ago',
            value: 399098,
        },
        onViewSoldToggle: () => null,
        onReloadPrices: () => null,
        ...customProps,
    };

    return render(<ListHeadFundsDesktop {...props} />);
};

test('gain span', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 2);

    const [gainSpan] = container.childNodes;
    t.is(gainSpan.tagName, 'A');
    t.is(gainSpan.childNodes.length, 3);
});

test('gain info', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;

    const [gainInfo, gainValues, cacheAge] = span.childNodes;

    t.is(gainInfo.tagName, 'SPAN');
    t.is(gainInfo.innerHTML, '£3,990.98');

    t.is(gainValues.tagName, 'SPAN');
    t.is(gainValues.childNodes.length, 2);

    const [gainPct, gainAbs] = gainValues.childNodes;

    t.is(gainPct.tagName, 'SPAN');
    t.is(gainAbs.tagName, 'SPAN');

    t.is(gainPct.innerHTML, '(0.23%)');
    t.is(gainAbs.innerHTML, '(£9.02)');

    t.is(cacheAge.tagName, 'SPAN');
    t.is(cacheAge.innerHTML, '(3 hours ago)');
});

test('reloading fund prices on click', t => {
    const onReloadPrices = sinon.spy();
    const { container } = getContainer({
        onReloadPrices,
    });

    t.is(onReloadPrices.getCalls().length, 0);
    fireEvent.click(container.childNodes[0]);
    t.is(onReloadPrices.getCalls().length, 1);
});

test('view sold toggle', t => {
    const onViewSoldToggle = sinon.spy();
    const { container } = getContainer({ onViewSoldToggle });

    const [, toggleViewSold] = container.childNodes;

    t.is(toggleViewSold.tagName, 'SPAN');
    t.is(toggleViewSold.childNodes.length, 2);

    const [input, span] = toggleViewSold.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'checkbox');
    t.is(input.checked, false);

    t.is(span.tagName, 'SPAN');
    t.is(span.innerHTML, 'View sold');

    t.is(onViewSoldToggle.getCalls().length, 0);
    fireEvent.click(input);
    t.is(onViewSoldToggle.getCalls().length, 1);
});
