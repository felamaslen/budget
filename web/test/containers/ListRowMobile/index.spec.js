import test from 'ava';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import PropTypes from 'prop-types';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import memoize from 'fast-memoize';
import { DateTime } from 'luxon';
import '~client-test/browser';
import { testState } from '~client-test/test_data/state';
import ListRowMobile from '~client/containers/ListRowMobile';
import { aMobileEditDialogOpened } from '~client/actions/form.actions';

const getContainer = memoize(() => {
    const AfterRowMobile = ({ row, colKeys }) => (
        <span className="my-after-row">{JSON.stringify({ row, colKeys })}</span>
    );

    AfterRowMobile.propTypes = {
        row: PropTypes.any,
        colKeys: PropTypes.any
    };

    const props = {
        page: 'food',
        id: 'my-id',
        colKeys: [0, 1, 2],
        AfterRowMobile
    };

    const store = createMockStore(testState);

    const { container, ...utils } = render(<Provider store={store}>
        <ListRowMobile {...props} />
    </Provider>);

    return { store, container, ...utils };
});

test('rendering an <li />', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;

    t.is(li.tagName, 'LI');
    t.is(li.childNodes.length, 4);
});

test('calling onEdit when clicked', t => {
    const { store, container } = getContainer();
    const [li] = container.childNodes;

    const action = aMobileEditDialogOpened('food', 'my-id');

    t.false(store.isActionDispatched(action));
    fireEvent.click(li);
    t.true(store.isActionDispatched(action));
});

test('cells', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [date, item, cost] = li.childNodes;

    t.is(date.tagName, 'SPAN');
    t.is(item.tagName, 'SPAN');
    t.is(cost.tagName, 'SPAN');

    t.is(date.innerHTML, `<span class="editable editable-date">${
        testState.pages.food.rows[0].cols[0].toLocaleString(DateTime.DATE_SHORT)
    }</span>`);
    t.is(item.innerHTML, '<span class="editable editable-item">something</span>');
    t.is(cost.innerHTML, '<span class="editable editable-cost">£3.43</span>');
});

test('custom after row component', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [, , , after] = li.childNodes;

    t.is(after.tagName, 'SPAN');
    t.is(after.className, 'my-after-row');
    t.is(after.innerHTML, '{"row":{"id":"my-id","cols":["2019-06-27T21:19:03.000+00:00","something",343]},"colKeys":[0,1,2]}');
});
