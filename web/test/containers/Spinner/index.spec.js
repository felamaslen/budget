import test from 'ava';
import '~client-test/browser';
import { render } from '@testing-library/react';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import Spinner from '~client/containers/Spinner';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        api: {
            initialLoading: true
        }
    });

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <Spinner {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'progress-outer');
    t.is(div.childNodes.length, 1);

    const [inner] = div.childNodes;

    t.is(inner.tagName, 'DIV');
    t.is(inner.className, 'progress-inner');
    t.is(inner.childNodes.length, 1);

    const [progress] = inner.childNodes;

    t.is(progress.tagName, 'DIV');
    t.is(progress.className, 'progress');
    t.is(progress.childNodes.length, 0);
});

test('not rendering if inactive', t => {
    const { container } = getContainer({}, state => ({
        ...state,
        api: {
            ...state.api,
            initialLoading: false
        }
    }));

    t.is(container.childNodes.length, 0);
});
