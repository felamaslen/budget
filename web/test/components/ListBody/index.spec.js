import test from 'ava';
import sinon from 'sinon';
import { createMockStore } from 'redux-test-utils';
import compose from 'just-compose';

import '~client-test/browser';
import { cleanup, render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { DateTime } from 'luxon';

import { testState } from '~client-test/test_data/state';
import ListBody from '~client/components/ListBody';
import { CREATE_ID } from '~client/constants/data';

const getContainer = (customProps = {}, customState = {}) => {
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
        suggestions: testState.suggestions,
        ...customState
    });

    return render(
        <Provider store={store}>
            <ListBody{...props} />
        </Provider>
    );
};

test.beforeEach(t => {
    t.context.clock = sinon.useFakeTimers(new Date('2019-08-04T11:54:23Z').getTime());
});

test.afterEach(t => {
    if (t.context.clock && t.context.clock.restore) {
        t.context.clock.restore();
    }

    cleanup();
});

const originalOffsetHeight = Reflect.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const originalOffsetWidth = Reflect.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

test.before(() => {
    Reflect.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 480 });
    Reflect.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 640 });
});

test.after(() => {
    Reflect.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    Reflect.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
});

test.serial('(desktop) basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'crud-list list-desktop');
    t.is(div.childNodes.length, 2);
});

test.serial('(desktop) head - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [head] = div.childNodes;

    t.is(head.tagName, 'DIV');
    t.is(head.className, 'list-head noselect');
});

test.serial('(desktop) list - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, list] = div.childNodes;

    t.is(list.tagName, 'DIV');
    t.is(list.className, 'crud-list-inner list-desktop-inner');
    t.is(list.childNodes.length, 2);
});

test.serial('(desktop) create - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [create] = list.childNodes;

    t.is(create.tagName, 'DIV');
    t.is(create.className, 'list-row-desktop list-row-desktop-create');
    t.is(create.childNodes.length, 6);
});

test.serial('(desktop) create - columns', t => {
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
});

test.serial('(desktop) adding a new item', t => {
    const onCreate = sinon.spy();

    const { container, getByLabelText } = getContainer({
        onCreate
    });

    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [create] = list.childNodes;

    const [date, item, category, cost, shop] = create.childNodes;

    fireEvent.mouseDown(date);
    const dateInput = getByLabelText('date-input-CREATE_ID');
    fireEvent.change(dateInput, { target: { value: '10' } });

    fireEvent.mouseDown(item);
    const itemInput = getByLabelText('item-input-CREATE_ID');
    fireEvent.change(itemInput, { target: { value: 'foo' } });

    fireEvent.mouseDown(category);
    const categoryInput = getByLabelText('category-input-CREATE_ID');
    fireEvent.change(categoryInput, { target: { value: 'bar' } });

    fireEvent.mouseDown(cost);
    const costInput = getByLabelText('cost-input-CREATE_ID');
    fireEvent.change(costInput, { target: { value: '10.65' } });

    fireEvent.mouseDown(shop);
    const shopInput = getByLabelText('shop-input-CREATE_ID');
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
});

test.serial('(desktop) onCreate is not called if there are missing data', t => {
    const onCreate = sinon.spy();

    const { container, getByLabelText } = getContainer({
        onCreate
    });

    const addButton = getByLabelText('add-button');

    fireEvent.mouseDown(addButton);
    fireEvent.click(addButton);
    t.is(onCreate.getCalls().length, 0);

    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [create] = list.childNodes;

    const [date, item, category, cost, shop] = create.childNodes;

    fireEvent.mouseDown(date);
    const dateInput = getByLabelText('date-input-CREATE_ID');
    fireEvent.change(dateInput, { target: { value: '10' } });

    fireEvent.mouseDown(addButton);
    fireEvent.click(addButton);
    t.is(onCreate.getCalls().length, 0);

    fireEvent.mouseDown(item);
    const itemInput = getByLabelText('item-input-CREATE_ID');
    fireEvent.change(itemInput, { target: { value: 'foo' } });

    fireEvent.mouseDown(addButton);
    fireEvent.click(addButton);
    t.is(onCreate.getCalls().length, 0);

    fireEvent.mouseDown(category);
    const categoryInput = getByLabelText('category-input-CREATE_ID');
    fireEvent.change(categoryInput, { target: { value: 'bar' } });

    fireEvent.mouseDown(addButton);
    fireEvent.click(addButton);
    t.is(onCreate.getCalls().length, 0);

    fireEvent.mouseDown(cost);
    const costInput = getByLabelText('cost-input-CREATE_ID');
    fireEvent.change(costInput, { target: { value: '10.65' } });

    fireEvent.mouseDown(addButton);
    fireEvent.click(addButton);
    t.is(onCreate.getCalls().length, 0);

    fireEvent.mouseDown(shop);
    const shopInput = getByLabelText('shop-input-CREATE_ID');
    fireEvent.change(shopInput, { target: { value: 'baz' } });

    t.is(onCreate.getCalls().length, 0);

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
});

test.serial('(desktop) input fields are cleared when navigating', t => {
    const onCreate = sinon.spy();
    const { getByLabelText } = getContainer({ onCreate });

    fireEvent.keyDown(window, { key: 'Tab' }); // -> date

    t.is(getByLabelText('date-input-CREATE_ID').value, DateTime.fromISO('2019-08-04').toLocaleString(DateTime.DATE_SHORT));
    fireEvent.change(getByLabelText('date-input-CREATE_ID'), { target: { value: '1/3/19' } });
    t.is(getByLabelText('date-input-CREATE_ID').value, '1/3/19');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> item

    t.is(getByLabelText('item-input-CREATE_ID').value, '');
    fireEvent.change(getByLabelText('item-input-CREATE_ID'), { target: { value: 'foo' } });
    t.is(getByLabelText('item-input-CREATE_ID').value, 'foo');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> category

    t.is(getByLabelText('category-input-CREATE_ID').value, '');
    fireEvent.change(getByLabelText('category-input-CREATE_ID'), { target: { value: 'bar' } });
    t.is(getByLabelText('category-input-CREATE_ID').value, 'bar');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> cost

    t.is(getByLabelText('cost-input-CREATE_ID').value, '');
    fireEvent.change(getByLabelText('cost-input-CREATE_ID'), { target: { value: '10.54' } });
    t.is(getByLabelText('cost-input-CREATE_ID').value, '10.54');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> shop

    t.is(getByLabelText('shop-input-CREATE_ID').value, '');
    fireEvent.change(getByLabelText('shop-input-CREATE_ID'), { target: { value: 'baz' } });
    t.is(getByLabelText('shop-input-CREATE_ID').value, 'baz');

    const addButton = getByLabelText('add-button');

    fireEvent.mouseDown(addButton);

    t.is(onCreate.getCalls().length, 0);
    fireEvent.click(addButton);
    t.is(onCreate.getCalls().length, 1);

    t.deepEqual(onCreate.getCalls()[0].args, ['food', {
        id: CREATE_ID,
        date: DateTime.fromISO('2019-03-01'),
        item: 'foo',
        category: 'bar',
        cost: 1054,
        shop: 'baz'
    }]);

    t.is(getByLabelText('date-input-CREATE_ID').value, DateTime.fromISO('2019-08-04').toLocaleString(DateTime.DATE_SHORT));

    fireEvent.keyDown(window, { key: 'Tab' }); // -> item
    t.is(getByLabelText('item-input-CREATE_ID').value, '');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> category
    t.is(getByLabelText('category-input-CREATE_ID').value, '');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> cost
    t.is(getByLabelText('cost-input-CREATE_ID').value, '');

    fireEvent.keyDown(window, { key: 'Tab' }); // -> shop
    t.is(getByLabelText('shop-input-CREATE_ID').value, '');
});

test('(desktop) prefilled category from suggestion doesn\'t affect subsequent rows', async t => {
    t.context.clock.restore();
    t.plan(4);

    const onUpdate = sinon.spy();
    const rows = [
        {
            id: 'id1',
            date: DateTime.fromISO('2019-08-03'),
            item: 'Bread',
            category: 'Breakfast',
            cost: 3,
            shop: 'Food shop'
        },
        {
            id: 'id2',
            date: DateTime.fromISO('2019-08-01'),
            item: 'Wine',
            category: 'Drinks',
            cost: 41,
            shop: 'Wine shop'
        }
    ];

    const { container, getByLabelText } = getContainer({
        onUpdate,
        rows
    }, {
        suggestions: {
            ...testState.suggestions,
            list: ['Apple', 'Chocolate'],
            next: ['Fruit', 'Confectionary']
        }
    });

    const [div] = container.childNodes;
    const [, list] = div.childNodes;
    const [, crudWindow] = list.childNodes;
    const [windowInner] = crudWindow.childNodes;
    const [boxOuter] = windowInner.childNodes;
    const [boxInner] = boxOuter.childNodes;
    const [row1] = boxInner.childNodes;

    const [, item1] = row1.childNodes;

    // activate "item" on row 1
    fireEvent.mouseDown(item1);

    // activate first suggestion item
    fireEvent.change(getByLabelText('item-input-id1'), { target: { value: 'a' } });

    console.log('navigating to suggestions');
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    t.is(onUpdate.getCalls().length, 1);
    t.deepEqual(onUpdate.getCalls()[0].args, [
        'food',
        'id1',
        {
            id: 'id1',
            date: DateTime.fromISO('2019-08-03'),
            item: 'Apple',
            category: 'Breakfast',
            cost: 3,
            shop: 'Food shop'
        },
        {
            id: 'id1',
            date: DateTime.fromISO('2019-08-03'),
            item: 'Bread',
            category: 'Breakfast',
            cost: 3,
            shop: 'Food shop'
        }
    ]);

    const nextLoop = fn => () => setImmediate(fn);

    await new Promise(resolve => compose(
        nextLoop,
        nextLoop
    )(() => {
        // assert that the suggestion next value was autocompleted
        t.is(getByLabelText('category-input-id1').value, 'Fruit');

        // navigate to the "category" field on row 2
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });

        // assert that row2's "category" value has not been overwritten
        // this was the bug caused by the command being sent to both rows
        t.is(getByLabelText('category-input-id2').value, 'Drinks');

        resolve();
    })());
});
