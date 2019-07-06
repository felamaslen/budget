import test from 'ava';
import { render } from 'react-testing-library';
import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'fast-memoize';
import { DateTime } from 'luxon';
import '~client-test/browser';
import ListRowMobile from '~client/components/ListRowMobile';

const getContainer = memoize(() => {
    const AfterRowMobile = ({ item }) => (
        <span className="my-after-row">{JSON.stringify({ item })}</span>
    );

    AfterRowMobile.propTypes = {
        item: PropTypes.any
    };

    const props = {
        page: 'food',
        item: {
            id: 'my-id',
            date: DateTime.fromISO('2019-07-06T18:39:32Z'),
            item: 'something',
            cost: 343
        },
        active: false,
        setActive: () => null,
        onUpdate: () => null,
        AfterRowMobile
    };

    return render(<ListRowMobile {...props} />);
});

test('rendering an <li />', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [li] = container.childNodes;

    t.is(li.tagName, 'LI');
    t.is(li.childNodes.length, 4);
});

test('cells', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [date, item, cost] = li.childNodes;

    t.is(date.tagName, 'SPAN');
    t.is(item.tagName, 'SPAN');
    t.is(cost.tagName, 'SPAN');

    t.is(date.innerHTML, `<span class="date"><span class="editable editable-date editable-inactive">${
        DateTime.fromISO('2019-07-06T18:39:32Z').toLocaleString(DateTime.DATE_SHORT)
    }</span></span>`);
    t.is(item.innerHTML, '<span class="item"><span class="editable editable-item editable-inactive">something</span></span>');
    t.is(cost.innerHTML, '<span class="cost"><span class="editable editable-cost editable-inactive">£3.43</span></span>');
});

test('custom after row component', t => {
    const { container } = getContainer();
    const [li] = container.childNodes;

    const [, , , after] = li.childNodes;

    t.is(after.tagName, 'SPAN');
    t.is(after.className, 'my-after-row');
    t.is(after.innerHTML, '{"item":{"id":"my-id","date":"2019-07-06T18:39:32.000+00:00","item":"something","cost":343}}');
});
