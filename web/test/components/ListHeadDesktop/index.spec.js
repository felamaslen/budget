import test from 'ava';
import { render } from 'react-testing-library';
import '~client-test/browser';
import memoize from 'fast-memoize';
import ListHeadDesktop from '~client/components/ListHeadDesktop';
import React from 'react';

const getContainer = memoize((customProps = {}) => {
    const AfterHead = () => null;

    const props = {
        page: 'food',
        weeklyValue: 100,
        getDaily: true,
        totalCost: 400,
        AfterHead,
        ...customProps
    };

    return render(<ListHeadDesktop {...props} />);
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.tagName, 'DIV');
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 7);
    t.is(div.className, 'list-head-inner noselect');
});

test('column headings', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    [0, 1, 2, 3, 4].forEach(key => t.is(div.childNodes[key].tagName, 'SPAN'));

    const [date, item, category, cost, shop] = div.childNodes;

    t.is(date.className, 'date');
    t.is(item.className, 'item');
    t.is(category.className, 'category');
    t.is(cost.className, 'cost');
    t.is(shop.className, 'shop');

    t.is(date.innerHTML, 'date');
    t.is(item.innerHTML, 'item');
    t.is(category.innerHTML, 'category');
    t.is(cost.innerHTML, 'cost');
    t.is(shop.innerHTML, 'shop');
});

test('daily column', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , , , , daily] = div.childNodes;

    t.is(daily.tagName, 'SPAN');
    t.is(daily.childNodes.length, 3);

    const [main, weekly, value] = daily.childNodes;

    t.is(main.tagName, 'SPAN');
    t.is(main.className, 'daily');
    t.is(main.innerHTML, 'Daily |');

    t.is(weekly.tagName, 'SPAN');
    t.is(weekly.className, 'weekly');
    t.is(weekly.innerHTML, 'Weekly:');

    t.is(value.tagName, 'SPAN');
    t.is(value.className, 'weekly-value');
    t.is(value.innerHTML, '£1.00');
});

test('total column', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , , , , , total] = div.childNodes;

    t.is(total.tagName, 'DIV');
    t.is(total.className, 'total-outer');

    t.is(total.childNodes.length, 2);

    const [text, value] = total.childNodes;

    t.is(text.tagName, 'SPAN');
    t.is(text.innerHTML, 'Total:');

    t.is(value.tagName, 'SPAN');
    t.is(value.className, 'total-value');
    t.is(value.innerHTML, '£4.00');
});
