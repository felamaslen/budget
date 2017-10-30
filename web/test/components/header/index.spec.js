import { expect } from 'chai';

import '../../browser';

import React from 'react';
import { shallow } from 'enzyme';

import Header from '../../../src/components/header';

import AppLogo from '../../../src/containers/app-logo';
import Navbar from '../../../src/containers/nav-bar';

describe('<Header/>', () => {
    const location = { pathname: 'foo-pathname' };
    const wrapper = shallow(<Header location={location} />);

    it('should render a navbar', () => expect(wrapper.find('.navbar')).to.have.length(1));

    const inner = wrapper.find('.navbar > .inner');
    it('should render an inner div', () => expect(inner).to.have.length(1));

    it('should render <AppLogo />', () => expect(inner.find(AppLogo)).to.have.length(1));

    const navbar = inner.find(Navbar);
    it('should render <Navbar />', () => expect(navbar).to.have.length(1));
    it('should pass pathname as a prop to the Navbar', () => {
        expect(navbar.props()).to.deep.equal({
            pathname: 'foo-pathname'
        });
    });
});

