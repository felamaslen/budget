/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import PageList from '../../../../src/containers/page/list';
import Body from '../../../../src/containers/page/list/body';
import AfterList from '../../../../src/containers/page/list/after-list';

describe('<PageList />', () => {
    const store = createMockStore(fromJS({
        pagesLoaded: {
            food: true
        }
    }));

    const props = {
        page: 'food'
    };

    const wrapper = shallow(<PageList {...props} />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.page-food')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
        expect(wrapper.childAt(0).is('div.list-insert.list-food.list')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is(Body)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).props()).to.deep.include({ page: 'food' });
        expect(wrapper.childAt(1).is(AfterList)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.deep.include({ page: 'food' });
    });
});

