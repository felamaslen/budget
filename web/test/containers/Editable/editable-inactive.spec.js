import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import EditableInactive from '~client/containers/Editable/editable-inactive';
import { formatValue } from '~client/containers/Editable/format';

describe('<EditableInactive />', () => {
    let activated = false;
    const props = {
        item: 'foo',
        value: 'bar',
        onActivate: () => {
            activated = true;
        }
    };

    beforeEach(() => {
        activated = false;
    });

    it('should render its basic structure', () => {
        const wrapper = shallow(<EditableInactive {...props} />);

        expect(wrapper.is('span.editable.editable-foo')).to.equal(true);
    });

    it('should render its formatted value', () => {
        const wrapper = shallow(<EditableInactive {...props} />);

        expect(wrapper.text()).to.equal(formatValue('foo', 'bar'));
    });

    it('should activate on mousedown', () => {
        const wrapper = shallow(<EditableInactive {...props} />);

        expect(activated).to.equal(false);

        wrapper.simulate('mousedown');

        expect(activated).to.equal(true);
    });
});

