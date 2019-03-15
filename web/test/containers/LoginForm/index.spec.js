/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import LoginForm from '~client/containers/LoginForm';
import PinDisplay from '~client/components/LoginForm/pin-display';
import NumberInputPad from '~client/components/LoginForm/number-input-pad';
import { LOGIN_FORM_INPUTTED } from '~client/constants/actions';

describe('<LoginForm />', () => {
    const state = fromJS({
        loginForm: {
            inputStep: 3,
            values: [5, 1, 2],
            visible: true,
            active: true
        }
    });

    const store = createMockStore(state);

    const wrapper = shallow(<LoginForm />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.login-form.active')).to.equal(true);
        expect(wrapper.children()).to.have.length(3);
    });

    it('should render a title', () => {
        expect(wrapper.childAt(0).is('h3')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('Enter your PIN:');
    });

    it('should render a <PinDisplay /> component', () => {
        expect(wrapper.childAt(1).is(PinDisplay)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.have.property('inputStep', 3);
    });

    it('should render a <NumberInputPad /> component', () => {
        expect(wrapper.childAt(2).is(NumberInputPad)).to.equal(true);
    });

    it('should pass an input function to the number pad', () => {
        expect(wrapper.childAt(2).props().onInput).to.be.a('function');

        expect(store.isActionDispatched({ type: LOGIN_FORM_INPUTTED, input: 5 })).to.equal(false);
        wrapper.childAt(2).props().onInput(5);
        expect(store.isActionDispatched({ type: LOGIN_FORM_INPUTTED, input: 5 })).to.equal(true);
    });
});

