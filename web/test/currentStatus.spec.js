import { expect } from 'chai';

import React from 'react';
import { shallow } from 'enzyme';
import CurrentStatus from '../../server/webui/components/CurrentStatus';

describe('<CurrentStatus/>', () => {
    it('should have a status element', () => {
        const wrapper = shallow(<CurrentStatus/>);
        expect(wrapper.find('span')).to.have.lengthOf(1);
    });

    it('should have a status property', () => {
        const testStatus = true;
        const wrapper = shallow(<CurrentStatus status={testStatus} />);
        expect(wrapper.instance().props.status).to.be.equal(testStatus);
    });
});

