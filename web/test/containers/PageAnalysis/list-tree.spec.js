/* eslint-disable newline-per-chained-call */
import { fromJS, List } from 'immutable';
import { expect } from 'chai';
import equal from 'deep-equal';
import itEach from 'it-each';
itEach();
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import ListTree from '../../../src/containers/PageAnalysis/list-tree';
import ListTreeHead from '../../../src/containers/PageAnalysis/list-tree-head';
import SubTree from '../../../src/containers/PageAnalysis/sub-tree';
import {
    ANALYSIS_TREE_EXPAND_TOGGLED, ANALYSIS_TREE_DISPLAY_TOGGLED, ANALYSIS_TREE_HOVERED
} from '../../../src/constants/actions';

describe('<ListTree />', () => {
    const state = fromJS({
        pages: {
            analysis: {
                cost: [
                    { name: 'foo1', total: 1, subTree: ['bar1'] },
                    { name: 'foo2', total: 4, subTree: ['bar2'] },
                    { name: 'foo3', total: 3, subTree: ['bar3'] },
                    { name: 'foo4', total: 6, subTree: ['bar4'] },
                    { name: 'foo5', total: 10, subTree: ['bar5'] }
                ],
                costTotal: 24
            }
        },
        other: {
            analysis: {
                treeVisible: {
                    foo1: true,
                    foo2: false,
                    foo3: true
                },
                treeOpen: {
                    foo1: true,
                    foo2: false,
                    foo3: false,
                    foo4: true
                }
            }
        }
    });

    const store = createMockStore(state);

    const wrapper = shallow(<ListTree />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.tree')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('ul.tree-list')).to.equal(true);
        expect(wrapper.childAt(0).children()).to.have.length(6);
    });

    it('should render a <ListTreeHead />', () => {
        expect(wrapper.childAt(0).childAt(0).is(ListTreeHead)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).props()).to.have.deep.property('items', List.of(
            { name: 'foo1', itemCost: 1, pct: 25 / 6, visible: true, open: true, subTree: fromJS(['bar1']) },
            { name: 'foo2', itemCost: 4, pct: 50 / 3, visible: false, open: false, subTree: fromJS(['bar2']) },
            { name: 'foo3', itemCost: 3, pct: 25 / 2, visible: true, open: false, subTree: fromJS(['bar3']) },
            { name: 'foo4', itemCost: 6, pct: 25, visible: true, open: true, subTree: fromJS(['bar4']) },
            { name: 'foo5', itemCost: 10, pct: 125 / 3, visible: true, open: false, subTree: fromJS(['bar5']) }
        ));
    });

    let key = null;
    beforeEach(() => {
        key = 0;
    });

    it.each([
        { name: 'foo1', visible: true, open: true, cost: '0.01', pct: '4.2' },
        { name: 'foo2', visible: false, open: false, cost: '0.04', pct: '16.7' },
        { name: 'foo3', visible: true, open: false, cost: '0.03', pct: '12.5' },
        { name: 'foo4', visible: true, open: true, cost: '0.06', pct: '25.0' },
        { name: 'foo5', visible: true, open: false, cost: '0.10', pct: '41.7' }
    ], 'should render a tree list body', ({ name, visible, open, cost, pct }) => {

        expect(wrapper.childAt(0).childAt(key + 1).is(`li.tree-list-item.${name}`)).to.equal(true);

        if (open) {
            expect(wrapper.childAt(0).childAt(key + 1).hasClass('open')).to.equal(true);
        }

        expect(wrapper.childAt(0).childAt(key + 1).children()).to.have.length(2);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).is('div.main')).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).children()).to.have.length(5);

        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(0).is('span.indicator')).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(0).children()).to.have.length(0);

        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(1).is('input')).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(1).props()).to.deep.include({
            type: 'checkbox',
            checked: visible
        });

        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(2).is('span.title')).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(2).text()).to.equal(name);

        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(3).is('span.cost')).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(3).text()).to.equal(`£${cost}`);

        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(4).is('span.pct')).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(4).text()).to.equal(` (${pct}%)`);

        expect(wrapper.childAt(0).childAt(key + 1).childAt(1).is(SubTree)).to.equal(true);
        expect(wrapper.childAt(0).childAt(key + 1).childAt(1).props()).to.deep.include({
            name, open, itemCost: 100 * Number(cost), subTree: fromJS([`bar${key + 1}`])
        });

        key++;
    });

    const numActionsDispatched = compare => store
        .getActions()
        .filter(action => equal(action, compare))
        .length;

    it.each([
        { name: 'foo1' },
        { name: 'foo2' },
        { name: 'foo3' },
        { name: 'foo4' },
        { name: 'foo5' }
    ], 'should expand items on click', ({ name }) => {

        expect(numActionsDispatched({ type: ANALYSIS_TREE_EXPAND_TOGGLED, key: name })).to.equal(0);
        wrapper.childAt(0).childAt(key + 1).childAt(0).simulate('click');
        expect(numActionsDispatched({ type: ANALYSIS_TREE_EXPAND_TOGGLED, key: name })).to.equal(1);

        key++;
    });

    it.each([
        { name: 'foo1' },
        { name: 'foo2' },
        { name: 'foo3' },
        { name: 'foo4' },
        { name: 'foo5' }
    ], 'should hover items on click', ({ name }) => {

        expect(numActionsDispatched({ type: ANALYSIS_TREE_HOVERED, key: [name] })).to.equal(0);
        wrapper.childAt(0).childAt(key + 1).childAt(0).simulate('mouseover');
        expect(numActionsDispatched({ type: ANALYSIS_TREE_HOVERED, key: [name] })).to.equal(1);

        expect(numActionsDispatched({ type: ANALYSIS_TREE_HOVERED, key: null })).to.equal(key);
        wrapper.childAt(0).childAt(key + 1).childAt(0).simulate('mouseout');
        expect(numActionsDispatched({ type: ANALYSIS_TREE_HOVERED, key: null })).to.equal(key + 1);

        key++;
    });

    it.each([
        { name: 'foo1' },
        { name: 'foo2' },
        { name: 'foo3' },
        { name: 'foo4' },
        { name: 'foo5' }
    ], 'should toggle items when clicking the tick box', ({ name }) => {
        expect(numActionsDispatched({ type: ANALYSIS_TREE_DISPLAY_TOGGLED, key: name })).to.equal(0);
        wrapper.childAt(0).childAt(key + 1).childAt(0).childAt(1).simulate('change');
        expect(numActionsDispatched({ type: ANALYSIS_TREE_DISPLAY_TOGGLED, key: name })).to.equal(1);

        key++;
    });
});

