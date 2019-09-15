import test from 'ava';
import { render } from '@testing-library/react';

import '~client-test/browser';
import React from 'react';
import DailyText from '~client/components/DailyText';

const testEmpty = (t, container) => {
    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.className, 'daily');
    t.is(span.childNodes.length, 0);
    t.is(span.innerHTML, '');
};

test('DailyText renders an empty span if the value is null or undefined', (t) => {
    const { container: noValue } = render(<DailyText />);
    testEmpty(t, noValue);

    const { container: nullValue } = render(<DailyText value={null} />);
    testEmpty(t, nullValue);
});

test('DailyText renders a formatted currency', (t) => {
    const { container } = render(<DailyText value={3462964} />);

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.className, 'daily');
    t.is(span.innerHTML, '£34,629.64');
});
