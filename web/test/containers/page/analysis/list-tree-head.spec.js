/* eslint-disable newline-per-chained-call */
import { List } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import ListTreeHead from '../../../../src/containers/page/analysis/list-tree-head';

describe('Analysis page <ListTreeHead />', () => {
    const props = {
        items: List.of(
            { itemCost: 3, pct: 5, visible: true },
            { itemCost: 5, pct: 8, visible: true },
            { itemCost: 1, pct: 2, visible: false }
        )
    };

    const wrapper = shallow(<ListTreeHead {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('li.tree-list-item.head')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is('div.inner')).to.equal(true);

        expect(wrapper.childAt(0).children()).to.have.length(4);
    });

    it('should render an indicator', () => {
        expect(wrapper.childAt(0).childAt(0).is('span.indicator')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).children()).to.have.length(0);
    });

    it('should render a title (Total:)', () => {
        expect(wrapper.childAt(0).childAt(1).is('span.title')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).text()).to.equal('Total:');
    });

    it('should render a total cost section', () => {
        expect(wrapper.childAt(0).childAt(2).is('span.cost')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).children()).to.have.length(2);

        expect(wrapper.childAt(0).childAt(2).childAt(0).is('div.total')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(0).text()).to.equal('£0.09');

        expect(wrapper.childAt(0).childAt(2).childAt(1).is('div.selected')).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(1).text()).to.equal('£0.08');
    });

    it('should render a total percent section', () => {
        expect(wrapper.childAt(0).childAt(3).is('span.pct')).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).children()).to.have.length(2);

        expect(wrapper.childAt(0).childAt(3).childAt(0).is('div.total')).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).childAt(0).text()).to.equal('15.0%');

        expect(wrapper.childAt(0).childAt(3).childAt(1).is('div.selected')).to.equal(true);
        expect(wrapper.childAt(0).childAt(3).childAt(1).text()).to.equal('13.0%');
    });
});

