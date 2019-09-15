import ava from 'ava';
import ninos from 'ninos';

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import HoverCost from '~client/components/HoverCost';

const test = ninos(ava);

const getContainer = memoize((customProps = {}) => {
    const props = {
        value: 123456.78,
        ...customProps,
    };

    return render(<HoverCost {...props} />);
});

test('rendering its value unmodified, if set not to abbreviate', (t) => {
    const { container } = getContainer({
        value: 'foo',
        abbreviate: false,
    });

    t.is(container.children.length, 1);

    const [child] = container.childNodes;

    t.is(child.tagName, 'SPAN');
    t.is(child.innerHTML, 'foo');
});

test('rendering an abbreviated currency value', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [child] = container.childNodes;

    t.is(child.tagName, 'SPAN');
    t.is(child.className, 'hover-cost');
    t.is(child.childNodes.length, 1);

    const [abbreviated] = child.childNodes;
    t.is(abbreviated.tagName, 'SPAN');
    t.is(abbreviated.className, 'abbreviated');
    t.is(abbreviated.innerHTML, '£1.2k');
});

test('rendering a hover label on hover', (t) => {
    const { container } = getContainer();

    const [child] = container.childNodes;

    t.is(child.childNodes.length, 1);
    fireEvent.mouseEnter(child);
    t.is(child.childNodes.length, 2);

    const [abbreviated, full] = child.childNodes;

    t.is(abbreviated.tagName, 'SPAN');
    t.is(abbreviated.innerHTML, '£1.2k');

    t.is(full.tagName, 'SPAN');
    t.is(full.className, 'full');
    t.is(full.innerHTML, '£1,234.57');
});

test('removing the label on mouseout', (t) => {
    const { container } = getContainer();

    const [child] = container.childNodes;

    fireEvent.mouseEnter(child);

    t.is(child.childNodes.length, 2);
    fireEvent.mouseLeave(child);
    t.is(child.childNodes.length, 1);

    t.is(child.childNodes[0].className, 'abbreviated');
    t.is(child.childNodes[0].innerHTML, '£1.2k');
});
