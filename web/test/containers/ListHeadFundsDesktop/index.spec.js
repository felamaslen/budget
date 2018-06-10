/* eslint-disable newline-per-chained-call */
import '../../browser';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import ListHeadFundsDesktop from '../../../src/containers/ListHeadFundsDesktop';
import { GRAPH_FUNDS_PERIOD_CHANGED } from '../../../src/constants/actions';
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

    it('should render its basic structure', () => {
        expect(wrapper.is('span.overall-gain.loss')).to.equal(true);
        expect(wrapper.hasClass('gain')).to.equal(false);

        expect(wrapper.children()).to.have.length(3);
    });

    it('should render a gain class', () => {
        const stateGain = state.setIn(['pages', 'funds', 'cache', 'year1', 'prices', 10, 'values', 30], 430);

        const wrapperLoss = shallow(<ListHeadFundsDesktop {...props} />, createMockStore(stateGain)).dive();

        expect(wrapperLoss.hasClass('profit')).to.equal(true);
        expect(wrapperLoss.hasClass('loss')).to.equal(false);
    });

    it('should render gain info', () => {
        expect(wrapper.childAt(0).is('span.value')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('£3,990.98');
        expect(wrapper.childAt(1).is('span.gain-values')).to.equal(true);
        expect(wrapper.childAt(1).children()).to.have.length(2);
        expect(wrapper.childAt(1).childAt(0).is('span.gain-pct')).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).text()).to.equal('(0.23%)');
        expect(wrapper.childAt(1).childAt(1).is('span.gain-abs')).to.equal(true);
        expect(wrapper.childAt(1).childAt(1).text()).to.equal('(£9.02)');
        expect(wrapper.childAt(2).is('span.cache-age')).to.equal(true);
        expect(wrapper.childAt(2).text()).to.equal('(3 hours ago)');
    });

    it('should reload fund prices on click', () => {
        const action = {
            type: GRAPH_FUNDS_PERIOD_CHANGED,
            shortPeriod: 'year1',
            noCache: true
        };

        expect(store.isActionDispatched(action)).to.equal(false);

        wrapper.simulate('click');

        expect(store.isActionDispatched(action)).to.equal(true);
    });
});

