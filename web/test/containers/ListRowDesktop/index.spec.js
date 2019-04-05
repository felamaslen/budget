import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { Map as map } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import ListRowDesktop from '~client/containers/ListRowDesktop';
import { aListItemDeleted } from '~client/actions/edit.actions';

const AfterRow = () => null;

const getContainer = memoize((customProps = {}, customState = null) => {
    let state = map({
        pages: map({
            food: map({
                rows: map([
                    [10, map({ foo: 'bar', future: true })],
                    [11, map({ bar: 'baz', future: false })]
                ])
            })
        }),
        edit: map({
            active: map({
                row: 10,
                col: 2
            })
        })
    });

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        page: 'food',
        id: 10,
        AfterRow,
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <ListRowDesktop {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;

    t.is(li.tagName, 'LI');
    t.is(li.className, 'future');
    t.is(li.childNodes.length, 7);
});

test('list of columns', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [rowCell] = li.childNodes;

    t.is(rowCell.tagName, 'SPAN');
    t.is(rowCell.className, 'date');
});

test('daily column', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [, , , , , span] = li.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'daily');
    t.is(span.childNodes.length, 0);
});

test('delete button', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [, , , , , , span] = li.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'delete');
    t.is(span.childNodes.length, 1);

    const [a] = span.childNodes;

    t.is(a.tagName, 'A');
    t.is(a.childNodes.length, 0);
});

test('dispatching an action when the delete button is pressed', t => {
    const { store, container } = getContainer();

    const action = aListItemDeleted({ page: 'food', id: 10 });

    t.false(store.isActionDispatched(action));

    fireEvent.click(container.childNodes[0].childNodes[6].childNodes[0]);

    t.true(store.isActionDispatched(action));
});

