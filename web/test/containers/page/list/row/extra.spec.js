/* eslint-disable newline-per-chained-call */
import { List as list, Map as map } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import { shallow as shallowNormal } from 'enzyme';
import shallow from '../../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import ListRowExtra, { ListRowExtraFunds } from '../../../../../src/containers/page/list/row/extra';
import GraphFundItem from '../../../../../src/containers/page/funds/graph/fund-item';

describe('List page <ListRowExtra />', () => {
    it('should render a <ListRowExtraFunds /> component for the funds page', () => {
        expect(shallowNormal(<ListRowExtra page="funds" />).is(ListRowExtraFunds)).to.equal(true);
    });

    it('should render nothing for other pages', () => {
        expect(shallowNormal(<ListRowExtra page="food" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListRowExtra page="general" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListRowExtra page="holiday" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListRowExtra page="social" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListRowExtra page="bills" />).get(0)).to.equal(null);
        expect(shallowNormal(<ListRowExtra page="income" />).get(0)).to.equal(null);
    });

    describe('<ListRowExtraFunds />', () => {
        const state = map({
            pages: map({
                funds: map({
                    rows: map([
                        [10, map({
                            historyPopout: true,
                            cols: list([null, 'foo-fund']),
                            gain: map({
                                value: 561932,
                                gain: 0.3,
                                gainAbs: 4030,
                                dayGain: -0.02,
                                dayGainAbs: -341,
                                color: list([255, 128, 30])
                            })
                        })]
                    ])
                })
            })
        });

        const store = createMockStore(state);

        const props = { id: 10 };

        const wrapper = shallow(<ListRowExtraFunds {...props} />, store).dive();

        it('should render its basic structure', () => {
            expect(wrapper.is('span.fund-extra-info.popout')).to.equal(true);
            expect(wrapper.children()).to.have.length(2);
        });

        it('should render a fund graph', () => {
            expect(wrapper.childAt(0).is('span.fund-graph')).to.equal(true);
            expect(wrapper.childAt(0).children()).to.have.length(1);
            expect(wrapper.childAt(0).childAt(0).is('div.fund-graph-cont')).to.equal(true);
            expect(wrapper.childAt(0).childAt(0).children()).to.have.length(1);
            expect(wrapper.childAt(0).childAt(0).childAt(0).is(GraphFundItem)).to.equal(true);
            expect(wrapper.childAt(0).childAt(0).childAt(0).props()).to.deep.include({
                name: 'foo-fund',
                id: 10
            });
        });

        it('should render gain info', () => {
            expect(wrapper.childAt(1).is('span.gain')).to.equal(true);
            expect(wrapper.childAt(1).children()).to.have.length(1);
            expect(wrapper.childAt(1).childAt(0).is('span.text.profit')).to.equal(true);
            expect(wrapper.childAt(1).childAt(0).children()).to.have.length(2);
            expect(wrapper.childAt(1).childAt(0).childAt(0).is('span.value')).to.equal(true);
            expect(wrapper.childAt(1).childAt(0).childAt(0).text()).to.equal('£5.6k');
            expect(wrapper.childAt(1).childAt(0).childAt(1).is('span.breakdown')).to.equal(true);
            expect(wrapper.childAt(1).childAt(0).childAt(1).children()).to.have.length(4);

            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(0).is('span.gain-abs.profit'))
                .to.equal(true);
            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(0).text()).to.equal('£40');

            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(1).is('span.day-gain-abs.loss'))
                .to.equal(true);
            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(1).text()).to.equal('(£3)');

            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(2).is('span.gain.profit'))
                .to.equal(true);
            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(2).text()).to.equal('30.00%');

            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(3).is('span.day-gain.loss'))
                .to.equal(true);
            expect(wrapper.childAt(1).childAt(0).childAt(1).childAt(3).text()).to.equal('(2.00%)');
        });
    });
});

