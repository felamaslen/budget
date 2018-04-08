/* eslint-disable newline-per-chained-call */
import { Map as map, List as list } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FundGainInfo from '../../../src/components/FundGainInfo';

describe('<FundGainInfo />', () => {
    it('should render gain info', () => {
        const props = {
            gain: map({
                value: 561932,
                gain: 0.3,
                gainAbs: 4030,
                dayGain: -0.02,
                dayGainAbs: -341,
                color: list([255, 128, 30])
            })
        };

        const wrapper = shallow(<FundGainInfo {...props} />);

        expect(wrapper.is('span.gain')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('span.text.profit')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(2);
        expect(wrapper.childAt(0).childAt(0).is('span.value')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('£5.6k');
        expect(wrapper.childAt(0).childAt(1).is('span.breakdown')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).children()).to.have.length(4);

        expect(wrapper.childAt(0).childAt(1).childAt(0).is('span.gain-abs.profit'))
            .to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(0).text()).to.equal('£40');

        expect(wrapper.childAt(0).childAt(1).childAt(1).is('span.day-gain-abs.loss'))
            .to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(1).text()).to.equal('(£3)');

        expect(wrapper.childAt(0).childAt(1).childAt(2).is('span.gain.profit'))
            .to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(2).text()).to.equal('30.00%');

        expect(wrapper.childAt(0).childAt(1).childAt(3).is('span.day-gain.loss'))
            .to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(3).text()).to.equal('(2.00%)');
    });
});

