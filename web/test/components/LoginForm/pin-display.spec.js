import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { shallow } from 'enzyme';
import React from 'react';
import PinDisplay from '~client/components/LoginForm/pin-display';

describe('<PinDisplay />', () => {
    const props = {
        inputStep: 2
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<PinDisplay {...props} />);

        expect(wrapper.is('div.pin-display')).to.equal(true);
        expect(wrapper.children()).to.have.length(4);
    });

    it.each([0, 1, 2, 3], 'should render each digit box', key => {
        const wrapper = shallow(<PinDisplay {...props} />);

        expect(wrapper.childAt(key).is('div.input-pin')).to.equal(true);

        const active = key === 2;
        const done = key < 2;

        expect(wrapper.childAt(key).hasClass('active')).to.equal(active);
        expect(wrapper.childAt(key).hasClass('done')).to.equal(done);
    });
});

