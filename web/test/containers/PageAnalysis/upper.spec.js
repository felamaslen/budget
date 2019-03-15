/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import Upper from '~client/containers/PageAnalysis/upper';
import { ANALYSIS_OPTION_CHANGED } from '~client/constants/actions';

describe('Analysis page <Upper />', () => {
    const state = fromJS({
        pages: {
            analysis: {
                description: 'foo'
            }
        },
        other: {
            analysis: {
                period: 0,
                grouping: 0,
                timeIndex: 0
            }
        }
    });

    const store = createMockStore(state);

    const wrapper = shallow(<Upper />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.upper')).to.equal(true);
        expect(wrapper.children()).to.have.length(4);
    });

    it('should render a period switcher', () => {
        expect(wrapper.childAt(0).is('span.input-period')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(4);
        expect(wrapper.childAt(0).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('Period:');

        expect(wrapper.childAt(0).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).children()).to.have.length(2);
        expect(wrapper.childAt(0).childAt(1).childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(0).props())
            .to.deep.include({ type: 'radio', checked: true });
        expect(wrapper.childAt(0).childAt(1).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(1).text()).to.equal('year');

        expect(wrapper.childAt(0).childAt(2).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).children()).to.have.length(2);
        expect(wrapper.childAt(0).childAt(2).childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(0).props())
            .to.deep.include({ type: 'radio', checked: false });
        expect(wrapper.childAt(0).childAt(2).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(1).text()).to.equal('month');

        expect(wrapper.childAt(0).childAt(3).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).children()).to.have.length(2);
        expect(wrapper.childAt(0).childAt(3).childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).childAt(0).props())
            .to.deep.include({ type: 'radio', checked: false });
        expect(wrapper.childAt(0).childAt(3).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).childAt(1).text()).to.equal('week');
    });

    it('should render a grouping switcher', () => {
        expect(wrapper.childAt(1).is('span.input-grouping')).to.equal(true);
        expect(wrapper.childAt(1).children()).to.have.length(3);
        expect(wrapper.childAt(1).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).text()).to.equal('Grouping:');

        expect(wrapper.childAt(1).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(1).children()).to.have.length(2);
        expect(wrapper.childAt(1).childAt(1).childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(1).childAt(1).childAt(0).props()).to.deep.include({
            type: 'radio', checked: true
        });
        expect(wrapper.childAt(1).childAt(1).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(1).childAt(1).text()).to.equal('category');

        expect(wrapper.childAt(1).childAt(2).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(2).children()).to.have.length(2);
        expect(wrapper.childAt(1).childAt(2).childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(1).childAt(2).childAt(0).props()).to.deep.include({
            type: 'radio', checked: false
        });
        expect(wrapper.childAt(1).childAt(2).childAt(1).is('span')).to.equal(true);
        expect(wrapper.childAt(1).childAt(2).childAt(1).text()).to.equal('shop');
    });

    it('should render buttons', () => {
        expect(wrapper.childAt(2).is('div.btns')).to.equal(true);
        expect(wrapper.childAt(2).children()).to.have.length(2);

        expect(wrapper.childAt(2).childAt(0).is('button.btn-previous')).to.equal(true);
        expect(wrapper.childAt(2).childAt(1).is('button.btn-next')).to.equal(true);
        expect(wrapper.childAt(2).childAt(1).props()).to.deep.include({ disabled: true });
    });

    it('should dispatch actions when the buttons are pressed', () => {
        expect(store.isActionDispatched({
            type: ANALYSIS_OPTION_CHANGED, period: 0, grouping: 0, timeIndex: 1
        })).to.equal(false);

        wrapper.childAt(2).childAt(0).simulate('click');

        expect(store.isActionDispatched({
            type: ANALYSIS_OPTION_CHANGED, period: 0, grouping: 0, timeIndex: 1
        })).to.equal(true);

        expect(store.isActionDispatched({
            type: ANALYSIS_OPTION_CHANGED, period: 0, grouping: 0, timeIndex: -1
        })).to.equal(false);

        wrapper.childAt(2).childAt(1).simulate('click');

        expect(store.isActionDispatched({
            type: ANALYSIS_OPTION_CHANGED, period: 0, grouping: 0, timeIndex: -1
        })).to.equal(true);
    });

    it('should render a description', () => {
        expect(wrapper.childAt(3).is('h3.period-title')).to.equal(true);
        expect(wrapper.childAt(3).text()).to.equal('foo');
    });
});

