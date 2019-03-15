/* eslint-disable newline-per-chained-call */
import chai, { expect } from 'chai';
import itEach from 'it-each';
itEach({ testPerIteration: true });
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import React from 'react';
import { NavLink } from 'react-router-dom';
import { shallow } from 'enzyme';
import Navbar from '~client/components/Navbar';

describe('<Navbar />', () => {
    const props = {
        active: true,
        onPageSet: sinon.spy(),
        onLogout: sinon.spy()
    };

    const wrapper = shallow(<Navbar {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('nav.nav-list.noselect')).to.equal(true);
        expect(wrapper.children()).to.have.length(10);
    });

    let key = null;
    before(() => {
        key = 0;
    });
    after(() => {
        key = 0;
    });

    it.each([
        { page: 'overview', path: '/' },
        { page: 'analysis', path: '/analysis' },
        { page: 'funds', path: '/funds' },
        { page: 'income', path: '/income' },
        { page: 'bills', path: '/bills' },
        { page: 'food', path: '/food' },
        { page: 'general', path: '/general' },
        { page: 'holiday', path: '/holiday' },
        { page: 'social', path: '/social' }
    ], 'should render a button for the %s page', ['page'], ({ page, path }) => {

        expect(wrapper.childAt(key).is(NavLink)).to.equal(true);
        expect(wrapper.childAt(key).props()).to.deep.include({
            exact: true,
            to: path,
            activeClassName: 'active',
            className: `nav-link nav-link-${page}`
        });

        wrapper.childAt(key).simulate('click');
        expect(props.onPageSet).to.have.been.calledWith(page);

        key++;
    });

    it('should render a logout button', () => {
        expect(wrapper.childAt(9).is('a.nav-link.nav-link-logout')).to.equal(true);
        expect(wrapper.childAt(9).text()).to.equal('Log out');

        expect(props.onLogout).not.to.have.been.calledWith();
        wrapper.childAt(9).simulate('click');
        expect(props.onLogout).to.have.been.calledWith();
    });

    it('should not render anything if inactive', () => {
        const wrapperInactive = shallow(<Navbar {...props} active={false} />);

        expect(wrapperInactive.get(0)).to.equal(null);
    });
});

