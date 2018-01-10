/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import React from 'react';
import shallow from '../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import AddForm from '../../../../src/containers/page/list/add-form';
import ListAddEditItem from '../../../../src/containers/editable/list-item';
import { EDIT_LIST_ITEM_ADDED } from '../../../../src/constants/actions';

describe('List page <AddForm />', () => {
    const state = fromJS({
        edit: {
            addBtnFocus: false
        }
    });

    const store = createMockStore(state);

    const props = {
        page: 'food'
    };

    const wrapper = shallow(<AddForm {...props} />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('li.li-add')).to.equal(true);
        expect(wrapper.children()).to.have.length(6);
    });

    it.each([0, 1, 2, 3, 4], 'should render add item form elements', col => {
        expect(wrapper.childAt(col).is(ListAddEditItem)).to.equal(true);
        expect(wrapper.childAt(col).props()).to.deep.include({
            page: 'food',
            row: -1,
            col,
            id: null
        });
    });

    it('should render an add button', () => {
        expect(wrapper.childAt(5).is('span.add-button-outer')).to.equal(true);
        expect(wrapper.childAt(5).children()).to.have.length(1);
        expect(wrapper.childAt(5).childAt(0).is('button')).to.equal(true);
        expect(wrapper.childAt(5).childAt(0).text()).to.equal('Add');
    });

    it('should dispatch an action when the add button is pressed', () => {
        expect(store.isActionDispatched({ type: EDIT_LIST_ITEM_ADDED, page: 'food' })).to.equal(false);

        wrapper.childAt(5).childAt(0).simulate('click');

        expect(store.isActionDispatched({ type: EDIT_LIST_ITEM_ADDED, page: 'food' })).to.equal(true);
    });
});

