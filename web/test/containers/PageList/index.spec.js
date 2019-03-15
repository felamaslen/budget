/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import PageList from '~client/containers/PageList';
import Page from '~client/containers/Page';
import ListBody from '~client/components/ListBody';

describe('<PageList />', () => {
    const store = createMockStore(fromJS({
        pagesLoaded: {
            food: true
        }
    }));

    const props = {
        page: 'food',
        After: () => null
    };

    const wrapper = shallow(<PageList {...props} />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is(Page)).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
        expect(wrapper.childAt(0).is('div.list-insert.list-food.list')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is(ListBody)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).props()).to.deep.include({ page: 'food' });
    });
});

