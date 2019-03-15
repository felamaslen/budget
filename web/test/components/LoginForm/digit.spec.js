import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import Digit from '~client/components/LoginForm/digit';

describe('<Digit />', () => {
    let input = null;
    const onInput = digit => {
        input = digit;
    };

    const props = {
        digit: 3,
        onInput
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<Digit {...props} />);

        expect(wrapper.is('button.btn-digit.btn-digit-3')).to.equal(true);
        expect(wrapper.text()).to.equal('3');
    });

    it('should handle input', () => {
        const wrapper = shallow(<Digit {...props} />);

        expect(input).to.equal(null);
        wrapper.simulate('mousedown');
        expect(input).to.equal(3);
    });
});

