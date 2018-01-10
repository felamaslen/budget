/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import ModalDialog from '../../../src/containers/modal-dialog';
import ModalDialogField from '../../../src/components/form-field/modal-dialog-field';
import { FORM_DIALOG_CLOSED } from '../../../src/constants/actions';

describe('<ModalDialog />', () => {
    const state = fromJS({
        currentPage: 'page1',
        modalDialog: {
            active: true,
            visible: true,
            loading: false,
            type: 'foo',
            row: 3,
            col: 4,
            id: 100,
            fields: [
                { item: 'blah' },
                { item: 'baz' }
            ],
            invalidKeys: ['xyz']
        }
    });

    const store = createMockStore(state);

    const wrapper = shallow(<ModalDialog />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.modal-dialog-outer.foo')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('div.dialog')).to.equal(true);
        expect(wrapper.childAt(0).hasClass('hidden')).to.equal(false);
        expect(wrapper.childAt(0).hasClass('loading')).to.equal(false);
        expect(wrapper.childAt(0).children()).to.have.length(3);
        expect(wrapper.childAt(0).childAt(0).is('span.title')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).is('ul.form-list')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).is('div.buttons')).to.equal(true);
    });

    it('should not render anything if inactive', () => {
        const wrapperInactive = shallow(<ModalDialog />, createMockStore(state
            .setIn(['modalDialog', 'active'], false)
        )).dive();

        expect(wrapperInactive.get(0)).to.equal(null);
    });

    it('should render a hidden class', () => {
        const wrapperHidden = shallow(<ModalDialog />, createMockStore(state
            .setIn(['modalDialog', 'visible'], false)
        )).dive();

        expect(wrapperHidden.childAt(0).hasClass('hidden')).to.equal(true);
    });

    it('should render a loading class', () => {
        const wrapperLoading = shallow(<ModalDialog />, createMockStore(state
            .setIn(['modalDialog', 'loading'], true)
        )).dive();

        expect(wrapperLoading.childAt(0).hasClass('loading')).to.equal(true);
    });

    it('should render a title', () => {
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('Editing id#100');
    });
    it('should render an adding title', () => {
        const wrapperAdding = shallow(<ModalDialog />, createMockStore(state
            .setIn(['modalDialog', 'id'], null)
        )).dive();

        expect(wrapperAdding.childAt(0).childAt(0).text()).to.equal('Add item');
    });

    it('should render a form list', () => {
        expect(wrapper.childAt(0).childAt(1).children()).to.have.length(2);

        expect(wrapper.childAt(0).childAt(1).childAt(0).is(ModalDialogField)).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(0).props()).to.deep.include({
            field: fromJS({ item: 'blah' }),
            fieldKey: 0,
            invalidKeys: fromJS(['xyz'])
        });

        expect(wrapper.childAt(0).childAt(1).childAt(1).is(ModalDialogField)).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(1).props()).to.deep.include({
            field: fromJS({ item: 'baz' }),
            fieldKey: 1,
            invalidKeys: fromJS(['xyz'])
        });
    });

    it('should render buttons', () => {
        expect(wrapper.childAt(0).childAt(2).children()).to.have.length(2);

        expect(wrapper.childAt(0).childAt(2).childAt(0).is('button.button-cancel')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(0).props()).to.deep.include({
            type: 'button',
            disabled: false
        });
        expect(wrapper.childAt(0).childAt(2).childAt(0).text()).to.equal('nope.avi');

        expect(wrapper.childAt(0).childAt(2).childAt(1).is('button.button-submit')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(1).props()).to.deep.include({
            type: 'button',
            disabled: false
        });
        expect(wrapper.childAt(0).childAt(2).childAt(1).text()).to.equal('Do it.');
    });

    it('should dispatch cancel action when pressing the cancel button', () => {
        expect(store.isActionDispatched({ type: FORM_DIALOG_CLOSED })).to.equal(false);
        wrapper.childAt(0).childAt(2).childAt(0).simulate('click');
        expect(store.isActionDispatched({ type: FORM_DIALOG_CLOSED })).to.equal(true);
    });

    it('should dispatch submit action when pressing the submit button', () => {
        expect(store.isActionDispatched({ type: FORM_DIALOG_CLOSED, page: 'page1' })).to.equal(false);
        wrapper.childAt(0).childAt(2).childAt(1).simulate('click');
        expect(store.isActionDispatched({ type: FORM_DIALOG_CLOSED, page: 'page1' })).to.equal(true);
    });

    it('should make the buttons disabled if loading', () => {
        const wrapperLoading = shallow(<ModalDialog />, createMockStore(state
            .setIn(['modalDialog', 'loading'], true)
        )).dive();

        expect(wrapperLoading.childAt(0).childAt(2).childAt(0).props()).to.have.property('disabled', true);
        expect(wrapperLoading.childAt(0).childAt(2).childAt(1).props()).to.have.property('disabled', true);
    });
});

