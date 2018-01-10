/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import PageAnalysis from '../../../../src/containers/page/analysis';
import Upper from '../../../../src/containers/page/analysis/upper';
import Timeline from '../../../../src/containers/page/analysis/timeline';
import ListTree from '../../../../src/containers/page/analysis/list-tree';
import Blocks from '../../../../src/containers/page/analysis/blocks';

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
        expect(wrapper.is('div.page-analysis')).to.equal(true);
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

    it('should render nothing if not loaded', () => {
        const wrapperNotLoaded = shallow(<PageAnalysis />, createMockStore(state
            .setIn(['pagesLoaded', 'analysis'], false)
        )).dive();

        expect(wrapperNotLoaded.get(0)).to.equal(null);
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

