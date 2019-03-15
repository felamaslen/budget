/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import '~client-test/browser.js';
import React from 'react';
import { shallow } from 'enzyme';
import Header from '~client/components/Header';
import AppLogo from '~client/components/AppLogo';
import Navbar from '~client/components/Navbar';

describe('<Header/>', () => {
    const props = {
        navActive: true,
        loadingApi: false,
        unsavedApi: false,
        onPageSet: () => null,
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

