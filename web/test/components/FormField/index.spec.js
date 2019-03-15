import '~client-test/browser.js';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FormFieldText from '~client/components/FormField';

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

        const input = wrapper.childAt(0);

        expect(input.is('input')).to.equal(true);
        expect(input.props()).to.deep.include({
            type: 'text',
            defaultValue: 'foo'
        });
    });

    it('should fire onChange', () => {
        const wrapper = shallow(<FormFieldText {...props} />);

        expect(changed).to.equal(null);

        const input = wrapper.childAt(0);

        input.simulate('change', { target: { value: 'bar' } });

        expect(changed).to.equal(null);

        input.simulate('blur');
    });
});

