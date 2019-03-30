import test from 'ava';
import { render } from 'react-testing-library';
import '~client-test/browser';
import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import reduction from '~client/reduction';
import FundsMeta from '~client/components/FundsMeta';
import { widthPageMobile } from '~client/constants/styles.json';

const getFundsMeta = (customProps = {}) => {
    const state = reduction;

    const store = createMockStore(state);

    const props = {
        page: 'funds',
        ...customProps
    };

    const utils = render((
        <Provider store={store}>
            <FundsMeta {...props} />
        </Provider>
    ));

    return { store, ...utils };
};

const testOuter = (t, container) => {
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'funds-info');
};

test('rendering a mobile info box', t => {
    window.matchMedia.setConfig({ type: 'screen', width: widthPageMobile - 1 });

    const { container } = getFundsMeta();

    testOuter(t, container);

    const [div] = container.childNodes;
    t.is(div.childNodes.length, 1);

    const [inner] = div.childNodes;
    t.is(inner.tagName, 'DIV');
    t.is(inner.className, 'funds-info-inner');
});

test('rendering a desktop info box', t => {
    window.matchMedia.setConfig({ type: 'screen', width: widthPageMobile + 1 });

    const { container } = getFundsMeta();

    testOuter(t, container);

    const [div] = container.childNodes;
    t.is(div.childNodes.length, 1);

    const [after] = div.childNodes;
    t.is(after.tagName, 'DIV');
    t.is(after.className, 'after-list');
    t.is(after.childNodes.length, 1);

    const [graphFunds] = after.childNodes;

    t.is(graphFunds.tagName, 'DIV');
    t.is(graphFunds.className, 'graph-container graph-fund-history');
});

