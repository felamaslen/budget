/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
itEach({ testPerIteration: true });
import React from 'react';
import { NavLink } from 'react-router-dom';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import Navbar from '../../../src/containers/nav-bar';
import { USER_LOGGED_OUT } from '../../../src/constants/actions';

describe('<Navbar />', () => {
    const store = createMockStore(fromJS({
        user: {
            uid: 1
        }
    }));

    const wrapper = shallow(<Navbar />, store).dive();

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
        // expect(wrapper.childAt(key).text()).to.equal(page);
        expect(wrapper.childAt(key).props()).to.deep.include({
            exact: true,
            to: path,
            activeClassName: 'active',
            className: `nav-link nav-link-${page}`
        });

        key++;
    });

    it('should render a logout button', () => {
        expect(wrapper.childAt(9).is('a.nav-link.nav-link-logout')).to.equal(true);
        expect(wrapper.childAt(9).text()).to.equal('Log out');

        expect(store.isActionDispatched({ type: USER_LOGGED_OUT })).to.equal(false);
        wrapper.childAt(9).simulate('click');
        expect(store.isActionDispatched({ type: USER_LOGGED_OUT })).to.equal(true);
    });

    it('should not render anything if inactive', () => {
        const wrapperInactive = shallow(<Navbar />, createMockStore(fromJS({
            user: {
                uid: 0
            }
        }))).dive();

        expect(wrapperInactive.get(0)).to.equal(null);
    });
});

