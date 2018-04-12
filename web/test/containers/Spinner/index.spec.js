/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import Spinner from '../../../src/containers/Spinner';

describe('<Spinner />', () => {
    const wrapper = shallow(<Spinner />, createMockStore(fromJS({
        loading: true
    }))).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.progress-outer')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('div.progress-inner')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is('div.progress')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).children()).to.have.length(0);
    });

    it('should not render anything if inactive', () => {
        expect(shallow(<Spinner />, createMockStore(fromJS({ loading: false }))).dive().get(0))
            .to.equal(null);
    });
});

