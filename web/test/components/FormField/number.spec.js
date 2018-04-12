import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FormFieldNumber from '../../../src/components/FormField/number';

describe('<FormFieldNumber />', () => {
    let changed = null;
    const onChange = value => {
        changed = value;
    };

    const props = {
        value: 103,
        onChange
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<FormFieldNumber {...props} />);

        expect(wrapper.is('div.form-field.form-field-number')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
    });

    it('should render an input', () => {
        const wrapper = shallow(<FormFieldNumber {...props} />);

        expect(wrapper.childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            type: 'number',
            defaultValue: 103
        });
    });

    it('should fire onChange', () => {
        const wrapper = shallow(<FormFieldNumber {...props} />);

        expect(changed).to.equal(null);

        wrapper.childAt(0).simulate('change', { target: { value: '10.93' } });

        expect(changed).to.equal(10.93);
    });
});
