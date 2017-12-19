/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';

import '../../browser';

import React from 'react';
import { shallow } from 'enzyme';

import Header from '../../../src/components/header';

import AppLogo from '../../../src/containers/app-logo';
import Navbar from '../../../src/containers/nav-bar';

describe('<Header/>', () => {
    const props = {
        location: {
            pathname: 'foo-pathname'
        }
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<Header {...props} />);

        expect(wrapper.is('div.navbar')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('div.inner')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(2);
    });

    it('should render an <AppLogo />', () => {
        const wrapper = shallow(<Header {...props} />);

        expect(wrapper.childAt(0).childAt(0).is(AppLogo)).to.equal(true);
    });

    it('should render an <Navbar />', () => {
        const wrapper = shallow(<Header {...props} />);

        expect(wrapper.childAt(0).childAt(1).is(Navbar)).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).props()).to.have.property('pathname', 'foo-pathname');
    });
});

