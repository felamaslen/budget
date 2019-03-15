/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import '~client-test/browser.js';
import React from 'react';
import { shallow } from 'enzyme';
import AppLogo from '~client/components/AppLogo';

describe('<AppLogo />', () => {
    it('should render its basic structure', () => {
        const props = {
            loading: true,
            unsaved: true
        };

        const wrapper = shallow(<AppLogo {...props} />);

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
        const props = {
            loading: false,
            unsaved: false
        };

        const wrapper = shallow(<AppLogo {...props} />);

        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('a.logo')).to.equal(true);
    });

    it('should not render a loading spinner if not loading a request', () => {
        const props = {
            loading: false,
            unsaved: true
        };

        const wrapper = shallow(<AppLogo {...props} />);

        expect(wrapper.childAt(1).children()).to.have.length(1);
        expect(wrapper.childAt(1).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).text()).to.equal('Budget');
    });
});

