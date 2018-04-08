/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import '../../browser';
import React from 'react';
import { shallow } from 'enzyme';
import Header from '../../../src/components/Header';
import AppLogo from '../../../src/components/AppLogo';
import Navbar from '../../../src/components/Navbar';

describe('<Header/>', () => {
    const props = {
        navActive: true,
        loadingApi: false,
        unsavedApi: false,
        onLogout: () => null
    };

    const wrapper = shallow(<Header {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.navbar')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('div.inner')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(2);
    });

    it('should render an <AppLogo />', () => {
        expect(wrapper.childAt(0).childAt(0).is(AppLogo)).to.equal(true);
    });

    it('should render a <Navbar />', () => {
        expect(wrapper.childAt(0).childAt(1).is(Navbar)).to.equal(true);
    });
});

