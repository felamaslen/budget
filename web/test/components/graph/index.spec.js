import '../../browser';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import Graph from '../../../src/components/graph';

// NOTE: this is a stub test! <Graph /> is assumed to work...

describe('<Graph />', () => {
    const props = {
        width: 100,
        height: 100,
        name: 'foo'
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<Graph {...props} />);

        expect(wrapper.is('div.graph-container.graph-foo')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
    });
});

