import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Upper from '~client/containers/PageAnalysis/upper';

const getContainer = (customProps = {}) => {
    const props = {
        period: 'year',
        grouping: 'category',
        page: 0,
        description: 'foo',
        onRequest: () => null,
        ...customProps,
    };

    return render(<Upper {...props} />);
};

test('basic structure', (t) => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 4);
});

test('period switcher - basic structure', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(input.tagName, 'SPAN');
    t.is(input.childNodes.length, 4);

    const [title] = input.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'Period:');
});

test('period switcher - year group', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    const [, yearGroup] = input.childNodes;

    t.is(yearGroup.tagName, 'SPAN');
    t.is(yearGroup.childNodes.length, 2);

    const [radioYear, titleYear] = yearGroup.childNodes;

    t.is(radioYear.tagName, 'INPUT');
    t.is(radioYear.type, 'radio');
    t.is(radioYear.checked, true);

    t.is(titleYear.innerHTML, 'year');
});

test('period switcher - month group', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    const [, , monthGroup] = input.childNodes;

    t.is(monthGroup.tagName, 'SPAN');
    t.is(monthGroup.childNodes.length, 2);

    const [radioMonth, titleMonth] = monthGroup.childNodes;

    t.is(radioMonth.tagName, 'INPUT');
    t.is(radioMonth.type, 'radio');
    t.is(radioMonth.checked, false);

    t.is(titleMonth.tagName, 'SPAN');
    t.is(titleMonth.innerHTML, 'month');
});

test('period switcher - week group', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    const [, , , weekGroup] = input.childNodes;

    const [radioWeek, titleWeek] = weekGroup.childNodes;

    t.is(radioWeek.tagName, 'INPUT');
    t.is(radioWeek.type, 'radio');
    t.is(radioWeek.checked, false);

    t.is(titleWeek.tagName, 'SPAN');
    t.is(titleWeek.innerHTML, 'week');
});

test('grouping switcher - basic structure', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, grouping] = div.childNodes;

    t.is(grouping.tagName, 'SPAN');
    t.is(grouping.childNodes.length, 3);

    const [title] = grouping.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'Grouping:');
});

test('grouping switcher - category group', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, grouping] = div.childNodes;

    const [, categoryGroup] = grouping.childNodes;

    t.is(categoryGroup.tagName, 'SPAN');
    t.is(categoryGroup.childNodes.length, 2);

    const [input, title] = categoryGroup.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'radio');
    t.is(input.checked, true);

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'category');
});

test('grouping switcher - shop group', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, grouping] = div.childNodes;

    const [, , shopGroup] = grouping.childNodes;

    t.is(shopGroup.tagName, 'SPAN');
    t.is(shopGroup.childNodes.length, 2);

    const [input, title] = shopGroup.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'radio');
    t.is(input.checked, false);

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'shop');
});

test('buttons', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, , buttons] = div.childNodes;

    t.is(buttons.tagName, 'DIV');
    t.is(buttons.childNodes.length, 2);

    const [previous, next] = buttons.childNodes;

    t.is(previous.tagName, 'BUTTON');
    t.is(previous.disabled, false);

    t.is(next.tagName, 'BUTTON');
    t.is(next.disabled, true);
});

test('calling functions when the buttons are pressed', (t) => {
    const onRequest = sinon.spy();
    const { container } = getContainer({
        page: 1,
        onRequest,
    });

    const [div] = container.childNodes;
    const [, , buttons] = div.childNodes;
    const [previous, next] = buttons.childNodes;

    fireEvent.click(previous);
    t.deepEqual(onRequest.getCalls()[0].args, [{ page: 2 }]);

    fireEvent.click(next);
    t.deepEqual(onRequest.getCalls()[1].args, [{ page: 0 }]);
});

test('description', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , , title] = div.childNodes;

    t.is(title.tagName, 'H3');
    t.is(title.innerHTML, 'foo');
});
