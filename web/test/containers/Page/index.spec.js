import { fromJS } from 'immutable';
import '../../browser';
import shallow from '../../shallow-with-store';
import { expect } from 'chai';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import Page from '../../../src/containers/Page';

describe('<Page />', () => {
    const state = fromJS({
        pagesLoaded: {
            food: false,
            general: true
        }
    });

    const store = createMockStore(state);

    it('should render a basic page container', () => {
        const wrapper = shallow((
            <Page page="general">
                <span>{'text'}</span>
            </Page>
        ), store).dive();

        expect(wrapper.is('div.page.page-general')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.text()).to.equal('text');
    });

    it('should render nothing if the page content is not loaded yet', () => {
        const wrapper = shallow((
            <Page page="food">
                <span>{'text'}</span>
            </Page>
        ), store).dive();

        expect(wrapper.get(0)).to.equal(null);
    });

});

