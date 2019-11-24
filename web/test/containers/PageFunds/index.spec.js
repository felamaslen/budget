import test from 'ava';
import '~client-test/browser';
import { render } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import { DateTime } from 'luxon';
import PageFunds from '~client/containers/PageFunds';
import { breakpoints } from '~client/styled/variables';
import { testState } from '~client-test/test_data/state';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        ...testState,
        now: DateTime.fromISO('2019-04-06T23:02Z'),
    });

    const store = createMockStore(state);

    const props = {
        ...customProps,
    };

    const utils = render(
        <Provider store={store}>
            <PageFunds {...props} />
        </Provider>,
    );

    return { store, ...utils };
};

test('list page with extra props', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
});

test('funds meta - mobile info box', t => {
    window.matchMedia.setConfig({ type: 'screen', width: breakpoints.mobile - 1 });

    const { container } = getContainer();

    const {
        childNodes: [, meta],
    } = container.childNodes[0];

    t.is(meta.tagName, 'DIV');
    t.is(meta.childNodes.length, 1);

    const [div] = meta.childNodes;
    t.is(div.childNodes.length, 2);

    const [gain, graph] = div.childNodes;

    t.is(gain.tagName, 'DIV');

    t.is(graph.tagName, 'DIV');
});

test('funds meta - desktop info box', t => {
    window.matchMedia.setConfig({ type: 'screen', width: breakpoints.mobile + 1 });

    const { container } = getContainer();
    const {
        childNodes: [, meta],
    } = container.childNodes[0];

    t.is(meta.tagName, 'DIV');
    t.is(meta.childNodes.length, 1);

    const [after] = meta.childNodes;

    t.is(after.tagName, 'DIV');
    t.is(after.childNodes.length, 2);

    const [stocksList, graphFunds] = after.childNodes;

    t.is(stocksList.tagName, 'DIV');

    t.is(graphFunds.tagName, 'DIV');
});
