import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import '~client-test/browser';
import memoize from 'fast-memoize';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { List as list } from 'immutable';
import { DateTime } from 'luxon';
import React from 'react';
import { Provider } from 'react-redux';
import reduction from '~client/reduction';
import ListBodyDesktop from '~client/components/ListBodyDesktop';

const getContainer = memoize((customProps = {}) => {
    const props = {
        page: 'food',
        rowIds: list.of(),
        addBtnFocus: false,
        onDesktopAdd: () => null,
        ...customProps
    };

    const state = reduction
        .set('page', 'food')
        .setIn(['edit', 'add', 'food'], list.of(
            DateTime.local(),
            'foo',
            'bar',
            302,
            'baz'
        ));

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <ListBodyDesktop {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('rendering basic structure', t => {
    const { container } = getContainer();

    t.is(container.tagName, 'DIV');
    t.is(container.childNodes.length, 1);

    const [ul] = container.childNodes;
    t.is(ul.tagName, 'UL');
    t.is(ul.childNodes.length, 2);
    t.is(ul.className, 'list-ul');
});

test('rendering a list head', t => {
    const { container } = getContainer();
    const [ul] = container.childNodes;

    const [listHead] = ul.childNodes;

    t.is(listHead.tagName, 'LI');
    t.is(listHead.className, 'list-head');
    t.is(listHead.childNodes.length, 1);

    const [listHeadDesktop] = listHead.childNodes;
    t.is(listHeadDesktop.tagName, 'DIV');
    t.is(listHeadDesktop.className, 'list-head-inner noselect');
});

test('rendering an add form', t => {
    const { container } = getContainer();
    const [ul] = container.childNodes;

    const [, addForm] = ul.childNodes;

    t.is(addForm.tagName, 'LI');
    t.is(addForm.className, 'li-add');
});

