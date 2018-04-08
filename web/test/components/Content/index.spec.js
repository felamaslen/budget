/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
itEach({ testPerIteration: true });
import '../../browser';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Switch } from 'react-router-dom';
import { mount } from 'enzyme';
import { createMockStore } from 'redux-test-utils';
import Content from '../../../src/components/Content';
import ModalDialog from '../../../src/containers/ModalDialog';

describe('<Content />', () => {
    const state = fromJS({
        user: {
            uid: 1
        },
        modalDialog: {
            active: false,
            visible: false,
            loading: false
        }
    });

    const props = {
        loggedIn: true
    };

    const store = createMockStore(state.set('currentPage', 'food'));

    const wrapper = mount(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/food']}>
                <Content {...props} />
            </MemoryRouter>
        </Provider>
    );

    it('should render a switch', () => {
        expect(wrapper.children()).to.have.length(2);
        expect(wrapper.childAt(0).is('div.inner')).to.equal(true);

        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is(Switch)).to.equal(true);
    });

    it('should render a modal dialog', () => {
        expect(wrapper.childAt(1).is(ModalDialog)).to.equal(true);
    });
});

