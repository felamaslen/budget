import test from 'ava';
import sinon from 'sinon';
import { createMockStore } from 'redux-test-utils';

import '~client-test/browser';
import { cleanup, render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { DateTime } from 'luxon';

import { testState } from '~client-test/test_data/state';
import ListBody from '~client/components/ListBody';
import { CREATE_ID } from '~client/constants/data';

const getContainer = (customProps = {}) => {
    const props = {
        page: 'food',
        isMobile: false,
        rows: [],
        onCreate: () => null,
        onUpdate: () => null,
        onDelete: () => null,
        ...customProps
    };

    const store = createMockStore({
        suggestions: testState.suggestions
    });

    return render(
        <Provider store={store}>
            <ListBody{...props} />
        </Provider>
    );
};

test('(desktop) basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'crud-list list-desktop');
    t.is(div.childNodes.length, 2);

    cleanup();
});

test('(desktop) head - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [head] = div.childNodes;

    t.is(head.tagName, 'DIV');
    t.is(head.className, 'list-head noselect');

    cleanup();
});

test('(desktop) list - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, list] = div.childNodes;

    t.is(list.tagName, 'DIV');
    t.is(list.className, 'crud-list-inner list-desktop-inner');
    t.is(list.childNodes.length, 2);

    cleanup();
});

test('(desktop) create - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [create] = list.childNodes;

    t.is(create.tagName, 'DIV');
    t.is(create.className, 'list-row-desktop list-row-desktop-create');
    t.is(create.childNodes.length, 6);

    cleanup();
});

test('(desktop) create - columns', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [create] = list.childNodes;

    const [date, item, category, cost, shop] = create.childNodes;

    t.is(date.tagName, 'SPAN');
    t.is(date.className, 'cell date');

    t.is(item.tagName, 'SPAN');
    t.is(item.className, 'cell item');

    t.is(category.tagName, 'SPAN');
    t.is(category.className, 'cell category');

    t.is(cost.tagName, 'SPAN');
    t.is(cost.className, 'cell cost');

    t.is(shop.tagName, 'SPAN');
    t.is(shop.className, 'cell shop');

    cleanup();
});

test('(desktop) adding a new item', t => {
    const clock = sinon.useFakeTimers(new Date('2019-08-04T11:54:23Z').getTime());
    const onCreate = sinon.spy();

    const { container, getByLabelText } = getContainer({
        onCreate
    });

    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [create] = list.childNodes;

    const [date, item, category, cost, shop] = create.childNodes;

    fireEvent.mouseDown(date);
    const dateInput = getByLabelText('date-input');
    fireEvent.change(dateInput, { target: { value: '10' } });

    fireEvent.mouseDown(item);
    const itemInput = getByLabelText('item-input');
    fireEvent.change(itemInput, { target: { value: 'foo' } });

    fireEvent.mouseDown(category);
    const categoryInput = getByLabelText('category-input');
    fireEvent.change(categoryInput, { target: { value: 'bar' } });

    fireEvent.mouseDown(cost);
    const costInput = getByLabelText('cost-input');
    fireEvent.change(costInput, { target: { value: '10.65' } });

    fireEvent.mouseDown(shop);
    const shopInput = getByLabelText('shop-input');
    fireEvent.change(shopInput, { target: { value: 'baz' } });

    t.is(onCreate.getCalls().length, 0);

    const addButton = getByLabelText('add-button');
    fireEvent.mouseDown(addButton);
    fireEvent.click(addButton);

    t.is(onCreate.getCalls().length, 1);
    t.deepEqual(onCreate.getCalls()[0].args, [
        'food',
        {
            id: CREATE_ID,
            date: DateTime.fromObject({ year: 2019, month: 8, day: 10 }),
            item: 'foo',
            category: 'bar',
            cost: 1065,
            shop: 'baz'
        }
    ]);

    clock.restore();
    cleanup();
});
