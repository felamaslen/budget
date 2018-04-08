/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import ErrorMessages from '../../../src/containers/ErrorMessages';
import { ERROR_LEVEL_ERROR, ERROR_LEVEL_WARN } from '../../../src/constants/error';
import { ERROR_CLOSED } from '../../../src/constants/actions';

describe('<ErrorMessages />', () => {
    const store = createMockStore(fromJS({
        errorMsg: [
            { id: 'f1101', level: ERROR_LEVEL_ERROR, closed: false, text: 'foo' },
            { id: 'g1923', level: ERROR_LEVEL_WARN, closed: true, text: 'bar' }
        ]
    }));

    const wrapper = shallow(<ErrorMessages />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('ul.messages-outer')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
    });

    it('should render each message', () => {
        expect(wrapper.childAt(0).is('li.message.error')).to.equal(true);
        expect(wrapper.childAt(0).hasClass('closed')).to.equal(false);
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('foo');

        expect(wrapper.childAt(1).is('li.message.warn.closed')).to.equal(true);
        expect(wrapper.childAt(1).text()).to.equal('bar');
    });

    it('should close messages when clicking them', () => {
        expect(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'f1101' })).to.equal(false);
        wrapper.childAt(0).simulate('click');
        expect(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'f1101' })).to.equal(true);

        expect(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'g1923' })).to.equal(false);
        wrapper.childAt(1).simulate('click');
        expect(store.isActionDispatched({ type: ERROR_CLOSED, msgId: 'g1923' })).to.equal(true);
    });
});

