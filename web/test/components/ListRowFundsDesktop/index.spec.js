/* eslint-disable newline-per-chained-call */
import { List as list, Map as map } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import GraphFundItem from '../../../src/containers/GraphFundItem';
import ListRowFundsDesktop from '../../../src/components/ListRowFundsDesktop';
import FundGainInfo from '../../../src/components/FundGainInfo';

describe('<ListRowFundsDesktop />', () => {
    const props = {
        id: 10,
        row: map({
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
        })
    };

    const wrapper = shallow(<ListRowFundsDesktop {...props} />);

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
        expect(wrapper.childAt(1).is(FundGainInfo)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.have.property('gain', props.row.get('gain'));
    });
});

