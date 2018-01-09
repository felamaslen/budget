/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import '../../browser';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import AppLogo from '../../../src/containers/app-logo';

describe('<AppLogo />', () => {
    it('should render its basic structure', () => {
        const wrapper = shallow(<AppLogo />, createMockStore(fromJS({
            loadingApi: true,
            edit: {
                requestList: ['foo']
            }
        }))).dive();

        expect(wrapper.is('div.app-logo')).to.equal(true);

        expect(wrapper.children()).to.have.length(2);

        expect(wrapper.childAt(0).is('span.queue-not-saved')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('Unsaved changes!');

        expect(wrapper.childAt(1).is('a.logo')).to.equal(true);
        expect(wrapper.childAt(1).children()).to.have.length(2);
        expect(wrapper.childAt(1).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).text()).to.equal('Budget');
        expect(wrapper.childAt(1).childAt(1).is('span.loading-api')).to.equal(true);
    });

    it('should not render unsaved changes, if there are no requests in the list', () => {
        const wrapper = shallow(<AppLogo />, createMockStore(fromJS({
            loadingApi: true,
            edit: {
                requestList: []
            }
        }))).dive();

        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('a.logo')).to.equal(true);
    });

    it('should not render a loading spinner if not loading a request', () => {
        const wrapper = shallow(<AppLogo />, createMockStore(fromJS({
            loadingApi: false,
            edit: {
                requestList: ['foo']
            }
        }))).dive();

        expect(wrapper.childAt(1).children()).to.have.length(1);
        expect(wrapper.childAt(1).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).text()).to.equal('Budget');
    });
});

