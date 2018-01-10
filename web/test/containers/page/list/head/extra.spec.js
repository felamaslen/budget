/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { shallow as shallowNormal } from 'enzyme';
import shallow from '../../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import ListHeadExtra, { ListHeadExtraFunds } from '../../../../../src/containers/page/list/head/extra';
import { GRAPH_FUNDS_PERIOD_CHANGED } from '../../../../../src/constants/actions';

describe('List page <ListHeadExtra />', () => {
    it('should render <ListHeadExtraFunds /> for funds page', () => {
        const wrapper = shallowNormal(<ListHeadExtra page="funds" foo="bar" />);

        expect(wrapper.is(ListHeadExtraFunds)).to.equal(true);
        expect(wrapper.props()).to.deep.include({ foo: 'bar' });
    });

    it('should render nothing for other pages', () => {
        expect(shallowNormal(<ListHeadExtra page="food" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListHeadExtra page="general" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListHeadExtra page="holiday" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListHeadExtra page="social" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListHeadExtra page="bills" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListHeadExtra page="income" />).get(0)).to.equal(null);
    });

    describe('<ListHeadExtraFunds />', () => {
        const state = fromJS({
            pages: {
                funds: {
                    data: {
                        total: 10000
                    }
                }
            },
            other: {
                graphFunds: {
                    period: 'year1'
                },
                fundsCachedValue: {
                    value: 10332,
                    ageText: '3 hours ago'
                }
            }
        });

        const store = createMockStore(state);

        const wrapper = shallow(<ListHeadExtraFunds />, store).dive();

        it('should render its basic structure', () => {
            expect(wrapper.is('span.gain.profit')).to.equal(true);
            expect(wrapper.hasClass('loss')).to.equal(false);

            expect(wrapper.children()).to.have.length(4);
        });

        it('should render a loss class', () => {
            const wrapperLoss = shallow(<ListHeadExtraFunds />, createMockStore(state
                .setIn(['other', 'fundsCachedValue', 'value'], 9867)
            )).dive();

            expect(wrapperLoss.hasClass('profit')).to.equal(false);
            expect(wrapperLoss.hasClass('loss')).to.equal(true);
        });

        it('should render gain info', () => {
            expect(wrapper.childAt(0).is('span.gain-info')).to.equal(true);
            expect(wrapper.childAt(0).text()).to.equal('Current value:');
            expect(wrapper.childAt(1).is('span.value')).to.equal(true);
            expect(wrapper.childAt(1).text()).to.equal('£103.32');
            expect(wrapper.childAt(2).is('span.gain-pct')).to.equal(true);
            expect(wrapper.childAt(2).text()).to.equal('3.32%');
            expect(wrapper.childAt(3).is('span.cache-age')).to.equal(true);
            expect(wrapper.childAt(3).text()).to.equal('(3 hours ago)');
        });

        it('should reload fund prices on click', () => {
            const action = {
                type: GRAPH_FUNDS_PERIOD_CHANGED,
                shortPeriod: 'year1',
                noCache: true,
                reloadPagePrices: true
            };

            expect(store.isActionDispatched(action)).to.equal(false);

            wrapper.simulate('click');

            expect(store.isActionDispatched(action)).to.equal(true);
        });
    });
});

