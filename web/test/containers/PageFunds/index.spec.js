import test from 'ava';
import '~client-test/browser';
import { Map as map, List as list, OrderedMap } from 'immutable';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import { DateTime } from 'luxon';
import PageFunds from '~client/containers/PageFunds';

const getContainer = (customProps = {}, customState = null) => {
    let state = map({
        now: DateTime.fromISO('2019-04-06T23:02Z'),
        edit: map({
            add: map({
                funds: list.of(
                    '',
                    ''
                )
            }),
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

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <PageFunds {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('list page with extra props', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'page page-funds');
});

