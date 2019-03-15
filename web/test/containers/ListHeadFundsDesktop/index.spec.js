/* eslint-disable newline-per-chained-call */
import '~client-test/browser.js';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import ListHeadFundsDesktop from '~client/containers/ListHeadFundsDesktop';
import { GRAPH_FUNDS_PERIOD_CHANGED } from '~client/constants/actions';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';

describe('<ListHeadFundsDesktop />', () => {
    const state = fromJS({
        now: DateTime.fromISO('2017-09-01T20:01Z'),
        pages: {
            funds: {
                cache: {
                    year1: {
                        prices: testPrices,
                        startTime: testStartTime,
                        cacheTimes: testCacheTimes
                    }
                },
                rows: testRows
            }
        },
        other: {
            graphFunds: {
                period: 'year1'
            }
        }
    });

    const props = {
        page: 'funds'
    };

    const store = createMockStore(state);

    const wrapper = shallow(<ListHeadFundsDesktop {...props} />, store).dive();

    const gainSpan = wrapper.childAt(0);

    it('should render a gain span', () => {
        expect(gainSpan.is('span.overall-gain.loss')).to.equal(true);
        expect(gainSpan.hasClass('gain')).to.equal(false);

        expect(gainSpan.children()).to.have.length(3);
    });

    it('should render a gain class', () => {
        const stateGain = state.setIn(['pages', 'funds', 'cache', 'year1', 'prices', 10, 'values', 30], 430);

        const wrapperLoss = shallow(<ListHeadFundsDesktop {...props} />, createMockStore(stateGain)).dive();

        const wrapperLossGainSpan = wrapperLoss.childAt(0);

        expect(wrapperLossGainSpan.hasClass('profit')).to.equal(true);
        expect(wrapperLossGainSpan.hasClass('loss')).to.equal(false);
    });

    it('should render gain info', () => {
        const gainInfo = gainSpan.childAt(0);

        expect(gainInfo.is('span.value')).to.equal(true);
        expect(gainInfo.text()).to.equal('£3,990.98');

        const gainValues = gainSpan.childAt(1);

        expect(gainValues.is('span.gain-values')).to.equal(true);
        expect(gainValues.children()).to.have.length(2);
        expect(gainValues.childAt(0).is('span.gain-pct')).to.equal(true);
        expect(gainValues.childAt(0).text()).to.equal('(0.23%)');
        expect(gainValues.childAt(1).is('span.gain-abs')).to.equal(true);
        expect(gainValues.childAt(1).text()).to.equal('(£9.02)');

        const cacheAge = gainSpan.childAt(2);

        expect(cacheAge.is('span.cache-age')).to.equal(true);
        expect(cacheAge.text()).to.equal('(3 hours ago)');
    });

    it('should reload fund prices on click', () => {
        const action = {
            type: GRAPH_FUNDS_PERIOD_CHANGED,
            shortPeriod: 'year1',
            noCache: true
        };

        expect(store.isActionDispatched(action)).to.equal(false);

        wrapper.childAt(0).simulate('click');

        expect(store.isActionDispatched(action)).to.equal(true);
    });
});

