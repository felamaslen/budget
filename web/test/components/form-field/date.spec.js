import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import FormFieldDate from '../../../src/components/form-field/date';
import { dateInput } from '../../../src/misc/date';

describe('<FormFieldDate />', () => {
    let changed = null;
    beforeEach(() => {
        changed = null;
    });

    const onChange = value => {
        changed = value;
    };

    const props = {
        value: dateInput('10/11/2017'),
        onChange
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<FormFieldDate{...props} />);

        expect(wrapper.is('div.form-field.form-field-date')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
    });

    it('should render an input', () => {
        const wrapper = shallow(<FormFieldDate {...props} />);

        expect(wrapper.childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            type: 'date',
            defaultValue: '2017-11-10'
        });
    });

    it('should fire onChange', () => {
        const wrapper = shallow(<FormFieldDate {...props} />);

        expect(changed).to.equal(null);

        wrapper.childAt(0).simulate('change', { target: { value: '9/4/14' } });

        expect(changed).to.deep.equal(dateInput('9/4/2014'));
    });

    it('should handle bad values', () => {
        const wrapper = shallow(<FormFieldDate {...props} />);

        expect(changed).to.equal(null);

        wrapper.childAt(0).simulate('change', { target: { value: 'not a date' } });

        expect(changed).to.equal(null);
    });
});
