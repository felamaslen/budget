/* eslint-disable newline-per-chained-call */
import { Map as map, List as list } from 'immutable';
import '~client-test/browser.js';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FundGainInfo from '~client/components/FundGainInfo';

describe('<FundGainInfo />', () => {
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

    it('should render gain info', () => {
        expect(wrapper.is('span.gain')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('span.text.profit')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(2);
    });

    it('should render the current value', () => {
        expect(wrapper.childAt(0).childAt(0).is('span.value')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('£5.6k');
    });

    const breakdown = wrapper.childAt(0).childAt(1);

    it('should render a breakdown', () => {
        expect(breakdown.is('span.breakdown')).to.equal(true);
        expect(breakdown.children()).to.have.length(2);
    });

    describe('the overall gain', () => {
        const overall = breakdown.childAt(0);

        it('should be rendered', () => {
            expect(overall.is('span.overall')).to.equal(true);
            expect(overall.children())
                .to.have.length(2);
        });

        it('should render an absolute value', () => {
            const absolute = overall.childAt(0);

            expect(absolute.is('span.gain-abs.profit')).to.equal(true);
            expect(absolute.text()).to.equal('£40');
        });
        it('should render a relative value', () => {
            const relative = overall.childAt(1);

            expect(relative.is('span.gain.profit')).to.equal(true);
            expect(relative.text()).to.equal('30.00%');
        });
    });

    describe('the daily gain', () => {
        const daily = breakdown.childAt(1);

        it('should be rendered', () => {
            expect(daily.is('span.day-gain-outer')).to.equal(true);
        });

        it('should render an absolute value', () => {
            const absolute = daily.childAt(0);

            expect(absolute.is('span.day-gain-abs.loss')).to.equal(true);
            expect(absolute.text()).to.equal('(£3)');
        });
        it('should render a relative value', () => {
            const relative = daily.childAt(1);

            expect(relative.is('span.day-gain.loss')).to.equal(true);
            expect(relative.text()).to.equal('(2.00%)');
        });
    });
});

