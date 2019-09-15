import test from 'ava';
import memoize from 'fast-memoize';
import { DateTime } from 'luxon';
import '~client-test/browser';
import { render } from '@testing-library/react';
import React from 'react';
import ListRowDesktop from '~client/components/ListRowDesktop';

const AfterRow = () => null;

const getContainer = memoize((customProps = {}) => {
    const props = {
        page: 'food',
        item: {
            id: '10',
            date: DateTime.fromISO('2019-07-16'),
            future: true,
            firstPresent: false,
            className: 'my-classname',
        },
        odd: false,
        command: {},
        setCommand: () => null,
        setActive: () => null,
        onUpdate: () => null,
        onDelete: () => null,
        daily: null,
        AfterRow,
        navNext: () => null,
        navPrev: () => null,
        ...customProps,
    };

    return render(<ListRowDesktop {...props} />);
});

test('basic structure', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'list-row-desktop my-classname future');
    t.is(div.childNodes.length, 7);
});

test('list of columns', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [rowCell] = div.childNodes;

    t.is(rowCell.tagName, 'SPAN');
    t.is(rowCell.className, 'cell date');
});

test('daily column', (t) => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , , , , span] = div.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'daily');
    t.is(span.childNodes.length, 0);
});
