import test from 'ava';
import '~client-test/browser';
import memoize from 'fast-memoize';
import { render } from '@testing-library/react';
import React from 'react';
import PinDisplay from '~client/components/LoginForm/pin-display';

const getContainer = memoize((customProps = {}) => {
    const props = {
        inputStep: 2,
        ...customProps,
    };

    return render(<PinDisplay {...props} />);
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 4);
});

test('each digit box', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    [0, 1, 2, 3].forEach(key => {
        const child = div.childNodes[key];

        t.is(child.tagName, 'DIV');
    });
});
