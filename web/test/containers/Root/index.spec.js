/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Root from '../../../src/containers/Root';
import ErrorMessages from '../../../src/containers/ErrorMessages';
import Spinner from '../../../src/containers/Spinner';
import LoginForm from '../../../src/containers/LoginForm';
import Content from '../../../src/components/Content';
import Header from '../../../src/components/Header';

describe('<Root />', () => {
    const state = fromJS({
        user: {
            uid: 1
        },
        loadingApi: false,
        edit: {
            requestList: []
        }
    });

    const store = createMockStore(state);

    const props = {
        store,
        foo: 'bar'
    };

    const wrapper = shallow(<Root {...props} />, store).dive();

    it('should render a Provider with store', () => {
        expect(wrapper.is(Provider)).to.equal(true);
        expect(wrapper.props()).to.have.property('store', store);
        expect(wrapper.children()).to.have.length(1);
    });

    it('should render a BrowserRouter', () => {
        expect(wrapper.childAt(0).is(BrowserRouter)).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(1);
    });

    it('should render a main div', () => {
        expect(wrapper.childAt(0).childAt(0).is('div.main')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).children()).to.have.length(5);
    });

    it('should render a Header', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(0).is(Header)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).childAt(0).props()).to.deep.include({
            foo: 'bar',
            loadingApi: false,
            navActive: true
        });
    });

    it('should render an ErrorMessages container', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(1).is(ErrorMessages)).to.equal(true);
    });

    it('should render a LoginForm container', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(2).is(LoginForm)).to.equal(true);
    });

    it('should render a Content component', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(3).is(Content)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).childAt(3).props()).to.deep.include({
            loggedIn: true
        });
    });

    it('should render a Spinner container', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(4).is(Spinner)).to.equal(true);
    });
});

