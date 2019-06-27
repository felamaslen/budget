import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import { PageList } from '~client/containers/PageList';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        edit: {
            addBtnFocus: false
        },
        pages: {
            funds: {
                rows: []
            },
            food: {
                data: {
                    total: 34
                }
            }
        },
        pagesLoaded: {
            food: true
        },
        other: {
        }
    });

    const store = createMockStore(state);

    const props = {
        page: 'food',
        After: () => null,
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <PageList {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'page page-food');
    t.is(div.childNodes.length, 1);
});

test('list', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [pageList] = div.childNodes;

    t.is(pageList.tagName, 'DIV');
    t.is(pageList.className, 'list-insert list-food list');
    t.is(pageList.childNodes.length, 0);
});
