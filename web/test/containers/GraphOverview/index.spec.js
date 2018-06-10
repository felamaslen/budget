/* eslint-disable newline-per-chained-call */
import { fromJS, Map as map, List as list } from 'immutable';
import '../../browser';
import React from 'react';
import shallowWithStore from '../../shallow-with-store';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { createMockStore } from 'redux-test-utils';
import { DateTime } from 'luxon';
import Media from 'react-media';
import { mediaQueryMobile } from '../../../src/constants';
import GraphOverview, { GraphOverviewWrapped } from '../../../src/containers/GraphOverview';
import GraphBalance from '../../../src/components/GraphBalance';
import GraphSpending from '../../../src/components/GraphSpending';
import { aShowAllToggled } from '../../../src/actions/graph.actions';

describe('<GraphOverview />', () => {
    const state = map({
        now: DateTime.fromISO('2018-03-02T12:36:49Z'),
        pages: map({
            overview: map({
                startDate: DateTime.fromObject({ year: 2018, month: 2, day: 28 }),
                endDate: DateTime.fromObject({ year: 2018, month: 5, day: 31 }),
                cost: fromJS({
                    funds: [983204, 983204, 983204, 983204, 983204, 983204, 983204, 983204],
                    income: [163613, 163613, 163613, 163613, 163613, 0, 0],
                    bills: [101992, 101992, 101992, 101992, 98106, 97356, 0, 0],
                    food: [26247, 22075, 23260, 11979, 11933, 1186, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    general: [59288, 12542, 9737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    holiday: [17820, 33019, 52100, 112722, 0, 46352, 9880, 0, 0, 0, 0, 0, 0],
                    social: [5440, 4560, 900, 4370, 2545, 700, 2491, 0, 0, 0, 0, 0, 0, 0],
                    balance: [1242000, 1830000, 1860000, 1890000, 1980000, 2000000, 0, 0, 0],
                    old: [488973, 332654, 247359, 208390, 156520, 839480, 641599, 543787, 556649, 649386],
                    net: [100, -10, 125, 160, 14, 145, 96, 76, 1],
                    spending: [143, 1032, 56891, 1923, 99130, 10, 1104, 9914, 8247]
                }),
                rows: list.of(
                    list.of(1654),
                    list.of(1872),
                    list.of(932),
                    list.of(9931)
                ),
                data: map({
                    numRows: 4,
                    numCols: 1
                })
            })
        }),
        other: map({
            windowWidth: 1045,
            showAllBalanceGraph: false
        })
    });

    const store = createMockStore(state);

    const wrapperContainer = shallowWithStore(<GraphOverview />, store);

    const wrapperProps = wrapperContainer.props();

    it('should render a media query', () => {
        const wrapper = wrapperContainer.dive();

        expect(wrapper.is(Media)).to.equal(true);
        expect(wrapper.props()).to.deep.include({
            query: mediaQueryMobile
        });
    });

    it('should dispatch the show all action', () => {
        expect(store.isActionDispatched(aShowAllToggled())).to.equal(false);
        wrapperContainer.props().onShowAll();
        expect(store.isActionDispatched(aShowAllToggled())).to.equal(true);
    });

    describe('<GraphOverviewWrapped />', () => {
        const propsWrapped = {
            ...wrapperProps,
            isMobile: false
        };

        const wrapper = shallow(<GraphOverviewWrapped {...propsWrapped} />);

        it('should render a container div', () => {
            expect(wrapper.is('div.graph-container-outer')).to.equal(true);
            expect(wrapper.children()).to.have.length(2);
        });

        it('should render a balance graph', () => {
            expect(wrapper.childAt(0).is(GraphBalance)).to.equal(true);
        });

        it('should render a spending graph', () => {
            expect(wrapper.childAt(1).is(GraphSpending)).to.equal(true);
        });

        it('should pass required props to the graphs', () => {
            expect(wrapper.childAt(0).props()).to.deep.include({
                now: DateTime.fromISO('2018-03-02T23:59:59.999Z'),
                name: 'balance',
                showAll: false,
                startDate: DateTime.fromISO('2018-02-28'),
                graphWidth: 500
            });
        });
    });
});

