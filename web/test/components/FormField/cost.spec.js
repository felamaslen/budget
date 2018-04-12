import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FormFieldCost from '../../../src/components/FormField/cost';

describe('<FormFieldCost />', () => {
    let changed = null;
    const onChange = value => {
        changed = value;
    };

    const props = {
        value: 10345,
        onChange
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<FormFieldCost {...props} />);

        expect(wrapper.is('div.form-field.form-field-cost')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
    });

    it('should render an input', () => {
        const wrapper = shallow(<FormFieldCost {...props} />);

        expect(wrapper.childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            type: 'number',
            step: '0.01',
            defaultValue: 103.45
        });
    });

    it('should fire onChange', () => {
        const wrapper = shallow(<FormFieldCost {...props} />);

        expect(changed).to.equal(null);

        wrapper.childAt(0).simulate('change', { target: { value: '10.93' } });

        expect(changed).to.equal(1093);
    });
});
