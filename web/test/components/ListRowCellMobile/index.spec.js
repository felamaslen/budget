import test from 'ava';
import { render } from '@testing-library/react';
import React from 'react';
import memoize from 'fast-memoize';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import '~client-test/browser';
import ListRowCellMobile from '~client/components/ListRowCellMobile';
import { testState } from '~client-test/test_data/state';

const getContainer = memoize(() => {
    const props = {
        page: 'food',
        colKey: 1,
        row: {
            id: 'my-id',
            cols: [null, 'some-item']
        },
        column: 'item'
    };

    const store = createMockStore(testState);

    return render(<Provider store={store}>
        <ListRowCellMobile {...props} />
    </Provider>);
});

test('rendering a <span />', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'item');
    t.is(span.childNodes.length, 1);
});

test('rendering an editable item', t => {
    const { container } = getContainer();

    const [span] = container.childNodes;
    const [editable] = span.childNodes;

    t.is(editable.tagName, 'SPAN');
    t.is(editable.className, 'editable editable-item');

    t.is(editable.childNodes.length, 1);
    t.is(editable.innerHTML, 'some-item');
});
