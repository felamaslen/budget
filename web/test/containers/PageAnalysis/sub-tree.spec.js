/* eslint-disable newline-per-chained-call */
import '../../browser';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import React from 'react';
import { shallow } from 'enzyme';
import SubTree from '../../../src/containers/PageAnalysis/sub-tree';

describe('Analysis page <SubTree />', () => {
    const props = {
        open: true,
        subTree: fromJS([
            { name: 'foo1', total: 2 },
            { name: 'foo2', total: 4 }
        ]),
        name: 'foo',
        itemCost: 6,
        onHover: () => null
    };

    const wrapper = shallow(<SubTree {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('ul.sub-tree')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
    });

    let key = null;
    before(() => {
        key = 0;
    });

    it.each([
        { name: 'foo1', cost: '0.02', pct: '33.3' },
        { name: 'foo2', cost: '0.04', pct: '66.7' }
    ], 'should render each sub tree item', ({ name, cost, pct }) => {

        expect(wrapper.childAt(key).is('li.tree-list-item')).to.equal(true);
        expect(wrapper.childAt(key).children()).to.have.length(1);
        expect(wrapper.childAt(key).childAt(0).is('div.main')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).children()).to.have.length(3);

        expect(wrapper.childAt(key).childAt(0).childAt(0).is('span.title')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(0).text()).to.equal(name);

        expect(wrapper.childAt(key).childAt(0).childAt(1).is('span.cost')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(1).text()).to.equal(`£${cost}`);

        expect(wrapper.childAt(key).childAt(0).childAt(2).is('span.pct')).to.equal(true);
        expect(wrapper.childAt(key).childAt(0).childAt(2).text()).to.equal(` (${pct}%)`);

        key++;
    });

    it('should not render anything if not open', () => {
        const wrapperNotOpen = shallow(<SubTree {...props} open={false} />);

        expect(wrapperNotOpen.get(0)).to.equal(null);
    });
});

