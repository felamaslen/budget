import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import ListHeadFunds from '~client/components/ListHeadFunds';

const getContainer = (customProps = {}) => {
    const props = {
        totalCost: 400000,
        viewSoldFunds: false,
        period: 'year1',
        cachedValue: {
            ageText: '3 hours ago',
            value: 399098,
            dayGain: 0.0329,
            dayGainAbs: 9964.92,
        },
        onViewSoldToggle: () => null,
        onReloadPrices: () => null,
        ...customProps,
    };

    return render(<ListHeadFunds {...props} />);
};

test('overall gain - value', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [main] = container.childNodes;
    const [overallGain] = main.childNodes;
    t.is(overallGain.childNodes.length, 2);

    const [valueContainer] = overallGain.childNodes;
    t.is(valueContainer.childNodes.length, 2);
    const [valueDesktop, valueMobile] = valueContainer.childNodes;

    t.is(valueDesktop.innerHTML, '£4k');
    t.is(valueMobile.innerHTML, '£3,990.98');
});

test('overall gain - breakdown', t => {
    const { container } = getContainer();

    const [main] = container.childNodes;
    const [overallGain] = main.childNodes;
    const [, breakdown] = overallGain.childNodes;

    t.is(breakdown.childNodes.length, 2);

    const [overall, dayGainOuter] = breakdown.childNodes;

    t.is(overall.childNodes.length, 2);
    t.is(dayGainOuter.childNodes.length, 2);

    const [gainAbs, gain] = overall.childNodes;
    const [dayGainAbs, dayGain] = dayGainOuter.childNodes;

    t.is(gainAbs.innerHTML, '(£9)');
    t.is(gain.innerHTML, '(0.23%)');
    t.is(dayGainAbs.innerHTML, '£100');
    t.is(dayGain.innerHTML, '3.29%');
});

test('reloading fund prices on click', t => {
    const onReloadPrices = sinon.spy();
    const { container } = getContainer({
        onReloadPrices,
    });

    const [main] = container.childNodes;
    t.is(onReloadPrices.getCalls().length, 0);
    fireEvent.click(main.childNodes[0]);
    t.is(onReloadPrices.getCalls().length, 1);
});

test('view sold toggle', t => {
    const onViewSoldToggle = sinon.spy();
    const { container } = getContainer({ onViewSoldToggle });

    const [main] = container.childNodes;
    const [, toggleViewSold] = main.childNodes;

    t.is(toggleViewSold.tagName, 'DIV');
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
