import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import memoize from 'fast-memoize';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import { Provider } from 'react-redux';
import reduction from '~client/reduction';
import ListBodyMobile from '~client/components/ListBodyMobile';

const getContainer = memoize((customProps = {}) => {
    const props = {
        page: 'food',
        onMobileAdd: () => null,
        ...customProps
    };

    const state = reduction;

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <ListBodyMobile {...props} />
        </Provider>

    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.tagName, 'DIV');
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 3);
});

test('list head', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [head] = div.childNodes;

    t.is(head.tagName, 'DIV');
    t.is(head.className, 'list-head noselect');
    t.is(head.childNodes.length, 3);

    head.childNodes.forEach(item => t.is(item.tagName, 'SPAN'));

    const [date, item, cost] = head.childNodes;

    t.is(date.className, 'list-head-column date');
    t.is(date.innerHTML, 'date');

    t.is(item.className, 'list-head-column item');
    t.is(item.innerHTML, 'item');

    t.is(cost.className, 'list-head-column cost');
    t.is(cost.innerHTML, 'cost');
});

test('row list', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, rows] = div.childNodes;

    t.is(rows.tagName, 'UL');
    t.is(rows.className, 'list-ul');
    t.is(rows.childNodes.length, 0);
});

test('add button', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , addButton] = div.childNodes;

    t.is(addButton.tagName, 'DIV');
    t.is(addButton.className, 'button-add-outer');
    t.is(addButton.childNodes.length, 1);

    const [button] = addButton.childNodes;

    t.is(button.tagName, 'BUTTON');
    t.is(button.className, 'button-add');
    t.is(button.innerHTML, 'Add');
});

test('calling a function when clicking add', t => {
    const onMobileAdd = t.context.stub();

    const { container } = getContainer({
        onMobileAdd
    });

    const [div] = container.childNodes;
    const [, , addButton] = div.childNodes;
    const [button] = addButton.childNodes;

    t.is(onMobileAdd.calls.length, 0);
    fireEvent.click(button);
    t.is(onMobileAdd.calls.length, 1);
    t.deepEqual(onMobileAdd.calls[0].arguments, ['food']);
});
