import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import Editable from '../../../src/components/editable';
import EditableActive from '../../../src/components/editable/editable-active';
import EditableInactive from '../../../src/components/editable/editable-inactive';

describe('<Editable />', () => {
    const props = { foo: 'bar' };

    it('should render <EditableActive /> if active', () => {
        const wrapper = shallow(<Editable active={true} {...props} />);

        expect(wrapper.is(EditableActive)).to.equal(true);
        expect(wrapper.props()).to.deep.equal(props);
    });

    it('should render <EditableInactive /> if not active', () => {
        const wrapper = shallow(<Editable active={false} {...props} />);

        expect(wrapper.is(EditableInactive)).to.equal(true);
        expect(wrapper.props()).to.deep.equal(props);
    });
});

