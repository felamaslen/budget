import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import { DateTime } from 'luxon';
import PageFunds from '~client/containers/PageFunds';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        now: DateTime.fromISO('2019-04-06T23:02Z'),
        edit: {
            active: {
                row: null,
                col: null
            },
            add: {
                funds: ['', '']
            },
            addBtnFocus: false
        },
        pages: {
            funds: {
                cache: {
                    year1: {
                        cacheTimes: [],
                        prices: []
                    }
                },
                rows: []
            }
        },
        pagesLoaded: {
            funds: true
        },
        other: {
            windowWidth: 1000,
            graphFunds: {
                mode: 0,
                period: 'year1',
                zoomRange: [0, 0],
                enabledList: []
            },
            stocksList: {
                loadedList: false,
                loadedInitial: false,
                stocks: {},
                indices: {},
                history: [],
                lastPriceUpdate: 0,
                weightedGain: 0,
                oldWeightedGain: 0
            }
        }
    });

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
