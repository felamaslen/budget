import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import Page from '~client/containers/Page';
import { aContentRequested } from '~client/actions/content.actions';

const getContainer = (customProps = {}, customState = null) => {
    let state = fromJS({
        pages: {
            food: {},
            general: {}
        }
    });

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        page: 'general',
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <Page {...props}>
                <span>{'text'}</span>
            </Page>
        </Provider>
    );

    return { store, ...utils };
};

test('basic page container', t => {
    const { container } = getContainer();

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'page page-general');

    t.is(div.childNodes.length, 1);

    const [span] = div.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.innerHTML, 'text');
});

test('rendering nothing if the page content is not loaded yet', t => {
    const { container } = getContainer({ page: 'holiday' });

    t.is(container.childNodes.length, 0);
});

test('dispatching an action when rendering', t => {
    const { store } = getContainer({ page: 'bills' });

    const action = aContentRequested({ page: 'bills' });

    t.true(store.isActionDispatched(action));
});
