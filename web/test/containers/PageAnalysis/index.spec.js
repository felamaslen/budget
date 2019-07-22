import test from 'ava';
import '~client-test/browser';
import { render } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import PageAnalysis from '~client/containers/PageAnalysis';
import { testState } from '~client-test/test_data/state';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        ...testState
    });

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <PageAnalysis {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [page] = container.childNodes;

    t.is(page.tagName, 'DIV');
    t.is(page.className, 'page page-analysis');
    t.is(page.childNodes.length, 2);

    const [upper, outer] = page.childNodes;

    t.is(upper.tagName, 'DIV');
    t.is(upper.className, 'upper');

    t.is(outer.tagName, 'DIV');
    t.is(outer.className, 'analysis-outer');
    t.is(outer.childNodes.length, 3);
});

test('timeline view', t => {
    const { container } = getContainer();
    const [page] = container.childNodes;
    const [, outer] = page.childNodes;

    const [timeline] = outer.childNodes;
    t.is(timeline.tagName, 'DIV');
    t.is(timeline.className, 'timeline-outer');
});

test('list tree', t => {
    const { container } = getContainer();
    const [page] = container.childNodes;
    const [, outer] = page.childNodes;

    const [, listTree] = outer.childNodes;
    t.is(listTree.tagName, 'DIV');
    t.is(listTree.className, 'tree');
});

test('block view', t => {
    const { container } = getContainer();
    const [page] = container.childNodes;
    const [, outer] = page.childNodes;

    const [, , blockView] = outer.childNodes;
    t.is(blockView.tagName, 'DIV');
    t.is(blockView.className, 'block-view');
});

test('not rendering a timeline if there is not one present', t => {
    const { container } = getContainer({}, state => ({
        ...state,
        analysis: {
            ...state.analysis,
            timeline: null
        }
    }));

    const [page] = container.childNodes;
    t.is(page.childNodes.length, 2);
    const [child0, child1] = page.childNodes;

    t.notRegex(child0.className, /timeline/);
    t.notRegex(child1.className, /timeline/);
});

test('nothing is rendered if the page hasn\'t loaded', t => {
    const { container } = getContainer({}, state => ({
        ...state,
        analysis: {
            ...state.analysis,
            cost: null,
            saved: null
        }
    }));

    t.is(container.childNodes.length, 0);
});
