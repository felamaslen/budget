/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import PageAnalysis from '~client/containers/PageAnalysis';
import Page from '~client/containers/Page';
import Upper from '~client/containers/PageAnalysis/upper';
import Timeline from '~client/containers/PageAnalysis/timeline';
import ListTree from '~client/containers/PageAnalysis/list-tree';
import Blocks from '~client/containers/PageAnalysis/blocks';

describe('<PageAnalysis />', () => {
    const state = fromJS({
        pagesLoaded: {
            analysis: true
        },
        other: {
            analysis: {
                timeline: [1, 2, 3]
            }
        }
    });

    const store = createMockStore(state);

    const wrapper = shallow(<PageAnalysis />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is(Page)).to.equal(true);
        expect(wrapper.props()).to.have.property('page', 'analysis');

        expect(wrapper.children()).to.have.length(2);

        expect(wrapper.childAt(0).is(Upper)).to.equal(true);

        expect(wrapper.childAt(1).is('div.analysis-outer')).to.equal(true);
        expect(wrapper.childAt(1).children()).to.have.length(3);
    });

    it('should render a timeline view', () => {
        expect(wrapper.childAt(1).childAt(0).is(Timeline)).to.equal(true);
        expect(wrapper.childAt(1).childAt(0).props())
            .to.have.deep.property('data', fromJS([1, 2, 3]));
    });

    it('should render a list tree', () => {
        expect(wrapper.childAt(1).childAt(1).is(ListTree)).to.equal(true);
    });

    it('should render a block view', () => {
        expect(wrapper.childAt(1).childAt(2).is(Blocks)).to.equal(true);
    });

    it('should not render a timeline if there is not one present', () => {
        const wrapperNoTimeline = shallow(<PageAnalysis />, createMockStore(state
            .setIn(['other', 'analysis', 'timeline'], null)
        )).dive();

        expect(wrapperNoTimeline.childAt(1).children()).to.have.length(2);
        expect(wrapperNoTimeline.childAt(1).childAt(0).is(ListTree)).to.equal(true);
        expect(wrapperNoTimeline.childAt(1).childAt(1).is(Blocks)).to.equal(true);
    });
});

