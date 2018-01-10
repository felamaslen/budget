/* eslint-disable newline-per-chained-call */
import { List } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import bodyMobile from '../../../../../src/containers/page/list/body/mobile';
import ListRowMobile from '../../../../../src/containers/page/list/row/mobile';
import { FORM_ADD_DIALOG_OPENED } from '../../../../../src/constants/actions';

describe('List page <BodyMobile />', () => {
    const BodyMobile = bodyMobile({}, () => ({}));

    const store = createMockStore({});

    const props = {
        page: 'food',
        rowIds: List.of(1, 2)
    };

    const wrapper = shallow(<BodyMobile {...props} />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div')).to.equal(true);
        expect(wrapper.children()).to.have.length(3);
    });

    it('should render a list head', () => {
        expect(wrapper.childAt(0).is('div.list-head.noselect')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(3);

        expect(wrapper.childAt(0).childAt(0).is('span.list-head-column.date')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('date');

        expect(wrapper.childAt(0).childAt(1).is('span.list-head-column.item')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).text()).to.equal('item');

        expect(wrapper.childAt(0).childAt(2).is('span.list-head-column.cost')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).text()).to.equal('cost');
    });

    it('should render rows', () => {
        expect(wrapper.childAt(1).is('ul.list-ul')).to.equal(true);
        expect(wrapper.childAt(1).children()).to.have.length(2);

        expect(wrapper.childAt(1).childAt(0).is(ListRowMobile)).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).props()).to.deep.include({
            page: 'food',
            id: 1,
            colKeys: [0, 1, 3]
        });

        expect(wrapper.childAt(1).childAt(1).is(ListRowMobile)).to.equal(true);
        expect(wrapper.childAt(1).childAt(1).props()).to.deep.include({
            page: 'food',
            id: 2,
            colKeys: [0, 1, 3]
        });
    });

    it('should render an add button', () => {
        expect(wrapper.childAt(2).is('div.button-add-outer')).to.equal(true);
        expect(wrapper.childAt(2).children()).to.have.length(1);
        expect(wrapper.childAt(2).childAt(0).is('button.button-add')).to.equal(true);
        expect(wrapper.childAt(2).childAt(0).text()).to.equal('Add');
    });

    it('should dispatch an add event when adding items', () => {
        expect(store.isActionDispatched({ type: FORM_ADD_DIALOG_OPENED, page: 'food' })).to.equal(false);
        wrapper.childAt(2).childAt(0).simulate('click');
        expect(store.isActionDispatched({ type: FORM_ADD_DIALOG_OPENED, page: 'food' })).to.equal(true);
    });
});

