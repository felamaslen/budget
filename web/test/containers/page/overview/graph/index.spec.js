import { fromJS, Map as map } from 'immutable';
import '../../../../browser';
import React from 'react';
import shallow from '../../../../shallow-with-store';
import { expect } from 'chai';
import { createMockStore } from 'redux-test-utils';
import { DateTime } from 'luxon';
import OverviewGraphs from '../../../../../src/containers/page/overview/graph';
import GraphBalance from '../../../../../src/containers/page/overview/graph/balance';
import { aShowAllToggled } from '../../../../../src/actions/graph.actions';

describe('<OverviewGraphs />', () => {
    const state = map({
        pages: map({
            overview: map({
                data: map({
                    startDate: DateTime.fromObject({ year: 2017, month: 2 }),
                    currentDate: DateTime.fromObject({ year: 2018, month: 3 }),
                    futureMonths: 5,
                    targets: fromJS([
                        {
                            tag: '1y',
                            value: 2166836
                        },
                        {
                            tag: '3y',
                            value: 3480000
                        },
                        {
                            tag: '5y',
                            value: 2287935
                        }
                    ]),
                    cost: fromJS({
                        funds: [983204, 983204, 983204, 983204, 983204, 983204, 983204, 983204],
                        income: [163613, 163613, 163613, 163613, 163613, 0, 0],
                        bills: [101992, 101992, 101992, 101992, 98106, 97356, 0, 0],
                        food: [26247, 22075, 23260, 11979, 11933, 1186, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        general: [59288, 12542, 9737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        holiday: [17820, 33019, 52100, 112722, 0, 46352, 9880, 0, 0, 0, 0, 0, 0],
                        social: [5440, 4560, 900, 4370, 2545, 700, 2491, 0, 0, 0, 0, 0, 0, 0],
                        balance: [1242000, 1830000, 1860000, 1890000, 1980000, 2000000, 0, 0, 0],
                        old: [488973, 332654, 247359, 208390, 156520, 839480, 641599, 543787, 556649, 649386]
                    })
                })
            })
        }),
        other: map({
            windowWidth: 1045,
            showAllBalanceGraph: false
        })
    });

    const store = createMockStore(state);

    const wrapper = shallow(<OverviewGraphs />, store).dive();

    it('should render balance and spending graphs', () => {
        expect(wrapper.is('div.graph-container-outer')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
        expect(wrapper.childAt(0).is(GraphBalance)).to.equal(true);
    });

    it('should pass required props to the graphs', () => {
        expect(wrapper.childAt(0).props()).to.deep.include({
            name: 'balance',
            cost: state.getIn(['pages', 'overview', 'data', 'cost']),
            showAll: false,
            targets: state.getIn(['pages', 'overview', 'data', 'targets']),
            startDate: DateTime.fromObject({ year: 2017, month: 2 }),
            currentDate: DateTime.fromObject({ year: 2018, month: 3 }),
            now: DateTime.fromObject({ year: 2018, month: 1, day: 22 }),
            graphWidth: 500
        });
    });

    it('should dispatch the show all action', () => {
        expect(store.isActionDispatched(aShowAllToggled())).to.equal(false);
        wrapper.childAt(0).props()
            .onShowAll();
        expect(store.isActionDispatched(aShowAllToggled())).to.equal(true);
    });

    it('should resize the graph for small screens', () => {
        expect(shallow(<OverviewGraphs />, createMockStore(state.setIn(['other', 'windowWidth'], 430))).dive()
            .childAt(0)
            .props()
        ).have.property('graphWidth', 430);
    });
});

