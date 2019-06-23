import test from 'ava';
import { render } from 'react-testing-library';

import '~client-test/browser';
import React from 'react';
import DailyText from '~client/components/DailyText';

test('DailyText renders nothing if the value is null', t => {
    const { container } = render(<DailyText value={null} />);

    t.is(container.childNodes.length, 0);
});

test('DailyText renders an empty span if the value is undefined', t => {
    const { container } = render(<DailyText />);

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.className, 'daily');
    t.is(span.childNodes.length, 0);
    t.is(span.innerHTML, '');
});

test('DailyText renders a formatted currency', t => {
    const { container } = render(<DailyText value={3462964} />);

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.className, 'daily');
    t.is(span.innerHTML, '£34,629.64');
});
