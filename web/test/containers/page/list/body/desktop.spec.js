/* eslint-disable newline-per-chained-call */
import { List } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import bodyDesktop from '../../../../../src/containers/page/list/body/desktop';
import HeadDesktop from '../../../../../src/containers/page/list/head/desktop';
import AddForm from '../../../../../src/containers/page/list/add-form';
import ListRow from '../../../../../src/containers/page/list/row/desktop';

describe('List page <BodyDesktop />', () => {
    const BodyDesktop = bodyDesktop({}, () => ({}));

    const props = {
        page: 'page1',
        rowIds: List.of(1, 2)
    };

    const wrapper = shallow(<BodyDesktop {...props} />, createMockStore({})).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('ul.list-ul')).to.equal(true);
        expect(wrapper.children()).to.have.length(4);
    });

    it('should render a list head', () => {
        expect(wrapper.childAt(0).is('li.list-head')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is(HeadDesktop)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).props()).to.have.property('page', 'page1');
    });

    it('should render an add form', () => {
        expect(wrapper.childAt(1).is(AddForm)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.have.property('page', 'page1');
    });

    it('should render rows', () => {
        expect(wrapper.childAt(2).is(ListRow)).to.equal(true);
        expect(wrapper.childAt(2).props()).to.include({
            page: 'page1',
            id: 1
        });

        expect(wrapper.childAt(3).is(ListRow)).to.equal(true);
        expect(wrapper.childAt(3).props()).to.include({
            page: 'page1',
            id: 2
        });
    });
});

