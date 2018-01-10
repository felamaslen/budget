/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { Router, Route } from 'react-router-dom';
import App from '../../../src/components/app';
import ErrorMessages from '../../../src/containers/error-messages';
import Spinner from '../../../src/containers/spinner';
import LoginForm from '../../../src/containers/login-form';
import Content from '../../../src/containers/content';
import Header from '../../../src/components/header';

describe('<App />', () => {
    const props = {
        history: { foo: 'bar' }
    };

    const wrapper = shallow(<App {...props} />);

    it('should render a react router', () => {
        expect(wrapper.is(Router)).to.equal(true);
        expect(wrapper.props()).to.deep.include({ history: { foo: 'bar' } });
    });

    it('should render a main div', () => {
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('div.main')).to.equal(true);
    });

    it('should render an <ErrorMessages /> container', () => {
        expect(wrapper.childAt(0).childAt(0).is(ErrorMessages)).to.equal(true);
    });
    it('should render a <Header /> route', () => {
        expect(wrapper.childAt(0).childAt(1).is(Route)).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).props()).to.deep.equal({
            path: '*',
            component: Header
        });
    });
    it('should render a <LoginForm /> container', () => {
        expect(wrapper.childAt(0).childAt(2).is(LoginForm)).to.equal(true);
    });
    it('should render a <Content /> route', () => {
        expect(wrapper.childAt(0).childAt(3).is(Route)).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).props()).to.deep.equal({
            path: '*',
            component: Content
        });
    });
    it('should render a <Spinner /> container', () => {
        expect(wrapper.childAt(0).childAt(4).is(Spinner)).to.equal(true);
    });
});

