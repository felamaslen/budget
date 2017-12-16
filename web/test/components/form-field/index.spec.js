import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FormFieldText from '../../../src/components/form-field';

describe('<FormFieldText />', () => {
    let changed = null;
    const onChange = value => {
        changed = value;
    };

    const props = {
        value: 'foo',
        onChange
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<FormFieldText {...props} />);

        expect(wrapper.is('div.form-field.form-field-text')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
    });

    it('should render an input', () => {
        const wrapper = shallow(<FormFieldText {...props} />);

        expect(wrapper.childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            type: 'text',
            defaultValue: 'foo'
        });
    });

    it('should fire onChange', () => {
        const wrapper = shallow(<FormFieldText {...props} />);

        expect(changed).to.equal(null);

        wrapper.childAt(0).simulate('change', { target: { value: 'bar' } });

        expect(changed).to.equal('bar');
    });
});

