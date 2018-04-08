/* eslint-disable newline-per-chained-call */
import { List } from 'immutable';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import React from 'react';
import { shallow } from 'enzyme';
import ListBodyDesktop from '../../../src/components/ListBodyDesktop';
import ListHeadDesktop from '../../../src/components/ListHeadDesktop';
import AddForm from '../../../src/components/ListBodyDesktop/AddForm';
import ListRowDesktop from '../../../src/containers/ListRowDesktop';

describe('<ListBodyDesktop />', () => {
    const props = {
        page: 'page1',
        rowIds: List.of(1, 2),
        addBtnFocus: false,
        onDesktopAdd: sinon.spy
    };

    const wrapper = shallow(<ListBodyDesktop {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('ul.list-ul')).to.equal(true);
        expect(wrapper.children()).to.have.length(4);
    });

    it('should render a list head', () => {
        expect(wrapper.childAt(0).is('li.list-head')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is(ListHeadDesktop)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).props()).to.have.property('page', 'page1');
    });

    it('should render an add form', () => {
        expect(wrapper.childAt(1).is(AddForm)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.have.property('page', 'page1');
    });

    it('should render rows', () => {
        expect(wrapper.childAt(2).is(ListRowDesktop)).to.equal(true);
        expect(wrapper.childAt(2).props()).to.include({
            page: 'page1',
            id: 1
        });

        expect(wrapper.childAt(3).is(ListRowDesktop)).to.equal(true);
        expect(wrapper.childAt(3).props()).to.include({
            page: 'page1',
            id: 2
        });
    });
});

