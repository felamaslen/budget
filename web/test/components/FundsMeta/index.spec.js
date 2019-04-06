import test from 'ava';
import { render } from 'react-testing-library';
import '~client-test/browser';
import { Map as map, List as list, OrderedMap } from 'immutable';
import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import { DateTime } from 'luxon';

import FundsMeta from '~client/components/FundsMeta';
import { widthPageMobile } from '~client/constants/styles.json';

const getFundsMeta = (customProps = {}) => {
    const state = map({
        now: DateTime.fromISO('2019-04-06T23:02Z'),
        edit: map({
            addBtnFocus: false
        }),
        pages: map({
            funds: map({
                cache: map({
                    year1: map({
                        cacheTimes: list.of(),
                        prices: list.of()
                    })
                }),
                rows: OrderedMap.of()
            })
        }),
        pagesLoaded: map({
            funds: true
        }),
        other: map({
            windowWidth: 1000,
            graphFunds: map({
                mode: 0,
                period: 'year1',
                zoomRange: list.of(0, 0),
                enabledList: OrderedMap.of()
            }),
            stocksList: map({
                loadedList: false,
                loadedInitial: false,
                stocks: map.of(),
                indices: map.of(),
                history: list.of(),
                lastPriceUpdate: 0,
                weightedGain: 0,
                oldWeightedGain: 0
            })
        })
    });

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

