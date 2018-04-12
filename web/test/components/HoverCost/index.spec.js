import '../../browser';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import HoverCost from '../../../src/components/HoverCost';

describe('<HoverCost />', () => {
    const wrapper = shallow(<HoverCost value={123456.78} />);

    it('should render its value unmodified, if set not to abbreviate', () => {
        const wrapperNone = shallow(<HoverCost value="foo" abbreviate={false} />);

        expect(wrapperNone.children()).to.have.length(1);
        expect(wrapperNone.text()).to.equal('foo');
    });

    it('should render an abbreviated currency value', () => {
        expect(wrapper.is('span.hover-cost')).to.equal(true);
        expect(wrapper.hasClass('hover')).to.equal(false);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('span.abbreviated')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('£1.2k');
    });

    it('should render a hover label on hover', () => {
        wrapper.simulate('mouseenter');

        expect(wrapper.children()).to.have.length(2);
        expect(wrapper.childAt(0).is('span.abbreviated')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('£1.2k');
        expect(wrapper.childAt(1).is('span.full')).to.equal(true);
        expect(wrapper.childAt(1).text()).to.equal('£1,234.57');
    });

    it('should remove the label on mouseout', () => {
        wrapper.simulate('mouseleave');

        expect(wrapper.children()).to.have.length(1);
    });
});

