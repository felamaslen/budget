import ava from 'ava';
import ninos from 'ninos';

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Digit from '~client/components/LoginForm/digit';

const test = ninos(ava);

const getContainer = memoize((customProps = {}) => {
    const props = {
        digit: 3,
        onInput: () => null,
        ...customProps,
    };

    return render(<Digit {...props} />);
});

test('basic structure', (t) => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [button] = container.childNodes;

    t.is(button.tagName, 'BUTTON');
    t.is(button.className, 'btn-digit btn-digit-3');
    t.is(button.innerHTML, '3');
});

test('handling input', (t) => {
    const onInput = t.context.stub();

    const { container } = getContainer({ onInput });

    t.is(onInput.calls.length, 0);

    const [button] = container.childNodes;

    fireEvent.mouseDown(button);

    t.is(onInput.calls.length, 1);
    t.deepEqual(onInput.calls[0].arguments, [3]);
});
