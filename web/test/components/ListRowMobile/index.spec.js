import test from 'ava';
import { render } from '@testing-library/react';
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
        item: PropTypes.any,
    };

    const props = {
        page: 'food',
        item: {
            id: 'my-id',
            date: DateTime.fromISO('2019-07-06T18:39:32Z'),
            item: 'something',
            cost: 343,
        },
        active: false,
        setActive: () => null,
        onUpdate: () => null,
        AfterRowMobile,
    };

    return render(<ListRowMobile {...props} />);
});

test('rendering the children of a list item', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'list-row-mobile');

    t.is(div.childNodes.length, 4);
});

test('cells', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [date, item, cost] = div.childNodes;

    t.is(date.tagName, 'SPAN');
    t.is(item.tagName, 'SPAN');
    t.is(cost.tagName, 'SPAN');

    t.is(date.className, 'column date');
    t.is(item.className, 'column item');
    t.is(cost.className, 'column cost');

    t.is(date.innerHTML, DateTime.fromISO('2019-07-06T18:39:32Z').toLocaleString(DateTime.DATE_SHORT));
    t.is(item.innerHTML, 'something');
    t.is(cost.innerHTML, '£3.43');
});

test('custom after row component', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, , , after] = div.childNodes;

    t.is(after.tagName, 'SPAN');
    t.is(after.className, 'my-after-row');
    t.is(after.innerHTML,
        '{"item":{"id":"my-id","date":"2019-07-06T18:39:32.000+00:00","item":"something","cost":343}}');
});
