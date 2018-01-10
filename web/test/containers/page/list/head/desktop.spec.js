/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import shallow from '../../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import ListHeadDesktop from '../../../../../src/containers/page/list/head/desktop';
import ListHeadExtra from '../../../../../src/containers/page/list/head/extra';

describe('List page <ListHeadDesktop />', () => {
    const store = createMockStore(fromJS({
        pages: {
            food: {
                data: {
                    weekly: 100,
                    total: 400
                }
            }
        }
    }));

    const props = {
        page: 'food'
    };

    const wrapper = shallow(<ListHeadDesktop {...props} />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.list-head-inner.noselect')).to.equal(true);
        expect(wrapper.children()).to.have.length(9);
    });

    it('should render a list head', () => {
        expect(wrapper.childAt(0).is('span.date')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('date');

        expect(wrapper.childAt(1).is('span.item')).to.equal(true);
        expect(wrapper.childAt(1).text()).to.equal('item');

        expect(wrapper.childAt(2).is('span.category')).to.equal(true);
        expect(wrapper.childAt(2).text()).to.equal('category');

        expect(wrapper.childAt(3).is('span.cost')).to.equal(true);
        expect(wrapper.childAt(3).text()).to.equal('cost');

        expect(wrapper.childAt(4).is('span.shop')).to.equal(true);
        expect(wrapper.childAt(4).text()).to.equal('shop');
    });

    it('should render a daily column for daily pages (with weekly totals)', () => {
        expect(wrapper.childAt(5).is('span')).to.equal(true);
        expect(wrapper.childAt(5).children()).to.have.length(3);

        expect(wrapper.childAt(5).childAt(0).is('span.daily')).to.equal(true);
        expect(wrapper.childAt(5).childAt(0).text()).to.equal('Daily');

        expect(wrapper.childAt(5).childAt(1).is('span.weekly')).to.equal(true);
        expect(wrapper.childAt(5).childAt(1).text()).to.equal('Weekly:');

        expect(wrapper.childAt(5).childAt(2).is('span.weekly-value')).to.equal(true);
        expect(wrapper.childAt(5).childAt(2).text()).to.equal('£1.00');
    });

    it('should render a total column', () => {
        expect(wrapper.childAt(6).is('span.total')).to.equal(true);
        expect(wrapper.childAt(6).text()).to.equal('Total:');

        expect(wrapper.childAt(7).is('span.total-value')).to.equal(true);
        expect(wrapper.childAt(7).text()).to.equal('£4.00');
    });

    it('should render any extra stuff', () => {
        expect(wrapper.childAt(8).is(ListHeadExtra)).to.equal(true);
        expect(wrapper.childAt(8).props()).to.have.property('page', 'food');
    });
});

