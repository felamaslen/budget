import ava from 'ava';
import ninos from 'ninos';
const test = ninos(ava);

import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import reduction from '~client/reduction';
import Timeline from '~client/containers/PageAnalysis/timeline';

const getContainer = memoize((customProps = {}) => {
    const timeline = [
        [1, 5, 3, 9],
        [93, 10, 24, 40],
        [43, 19, 33.2, 10],
        [9, 23.5, 52, 1],
        [40, 3, 1, 20]
    ];

    const props = {
        data: timeline,
        ...customProps
    };

    const state = reduction;

    const store = createMockStore(state);

    const utils = render(
        <Provider store={store}>
            <Timeline {...props} />
        </Provider>
    );

    return { store, ...utils };
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'timeline-outer');
    t.is(div.childNodes.length, 5);
});

test('timeline items', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const items = [
        { color: 'rgb(211, 231, 227)' },
        { color: 'rgb(218, 209, 209)' },
        { color: 'rgb(215, 213, 214)' },
        { color: 'rgb(204, 219, 223)' },
        { color: 'rgb(224, 213, 211)' }
    ];

    items.forEach(({ color }, index) => {
        const child = div.childNodes[index];

        t.is(child.tagName, 'SPAN');
        t.is(child.className, 'data-item');
        t.is(child.style.backgroundColor, color);
    });
});
