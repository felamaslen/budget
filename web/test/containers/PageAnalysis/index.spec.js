import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import PageAnalysis from '~client/containers/PageAnalysis';

const getContainer = (customProps = {}, customState = null) => {
    let state = {
        pages: {
            analysis: {
                cost: []
            }
        },
        pagesLoaded: {
            analysis: true
        },
        other: {
            blockView: {
                active: null
            },
            analysis: {
                period: 0,
                grouping: 0,
                timeIndex: 0,
                treeVisible: {},
                treeOpen: {},
                timeline: [
                    [1, 2, 3]
                ]
            }
        }
    };

    if (customState) {
        state = customState(state);
    }

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
        other: {
            ...state.other,
            analysis: {
                ...state.other.analysis,
                timeline: null
            }
        }
    }));

    const [page] = container.childNodes;
    t.is(page.childNodes.length, 2);
    const [child0, child1] = page.childNodes;

    t.notRegex(child0.className, /timeline/);
    t.notRegex(child1.className, /timeline/);
});
