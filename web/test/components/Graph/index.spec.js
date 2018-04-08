/* eslint-disable newline-per-chained-call */
import '../../browser';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import Graph from '../../../src/components/Graph';

describe('<Graph />', () => {
    const basicProps = {
        name: 'foo',
        width: 200,
        height: 100,
        padding: [10, 10, 10, 10],
        svgClasses: 'svgClass1 svgClass2'
    };

    const wrapper = shallow((
        <Graph {...basicProps}>
            <span>{'foo'}</span>
        </Graph>
    ));

    it('should render a basic container', () => {
        expect(wrapper.is('div.graph-container.graph-foo')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
    });

    it('should render an SVG with a custom class', () => {
        expect(wrapper.childAt(0).is('svg')).to.equal(true);
        expect(wrapper.childAt(0).hasClass('svgClass1')).to.equal(true);
        expect(wrapper.childAt(0).hasClass('svgClass2')).to.equal(true);

        expect(wrapper.childAt(0).props()).to.deep.include({
            width: 200,
            height: 100
        });
    });

    it('should render its children inside the SVG', () => {
        expect(wrapper.childAt(0).children()).to.have.length(1);
        expect(wrapper.childAt(0).childAt(0).is('span')).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).text()).to.equal('foo');
    });

    it('should accept a child before the SVG', () => {
        const beforeProps = {
            ...basicProps,
            before: <span>{'before1'}</span>
        };

        const wrapperBefore = shallow((
            <Graph {...beforeProps}>
                <span>{'foo'}</span>
            </Graph>
        ));

        expect(wrapperBefore.children()).to.have.length(2);
        expect(wrapperBefore.childAt(1).is('svg')).to.equal(true);
        expect(wrapperBefore.childAt(0).is('span')).to.equal(true);
        expect(wrapperBefore.childAt(0).text()).to.equal('before1');
    });

    it('should accept a child after the SVG', () => {
        const afterProps = {
            ...basicProps,
            after: <span>{'after1'}</span>
        };

        const wrapperAfter = shallow((
            <Graph {...afterProps}>
                <span>{'foo'}</span>
            </Graph>
        ));

        expect(wrapperAfter.children()).to.have.length(2);
        expect(wrapperAfter.childAt(0).is('svg')).to.equal(true);
        expect(wrapperAfter.childAt(1).is('span')).to.equal(true);
        expect(wrapperAfter.childAt(1).text()).to.equal('after1');
    });

    it('should accept children before and after the SVG', () => {
        const beforeAfterProps = {
            ...basicProps,
            before: <span>{'before1'}</span>,
            after: <span>{'after1'}</span>
        };

        const wrapperBeforeAfter = shallow((
            <Graph {...beforeAfterProps}>
                <span>{'foo'}</span>
            </Graph>
        ));

        expect(wrapperBeforeAfter.children()).to.have.length(3);
        expect(wrapperBeforeAfter.childAt(0).is('span')).to.equal(true);
        expect(wrapperBeforeAfter.childAt(0).text()).to.equal('before1');
        expect(wrapperBeforeAfter.childAt(1).is('svg')).to.equal(true);
        expect(wrapperBeforeAfter.childAt(2).is('span')).to.equal(true);
        expect(wrapperBeforeAfter.childAt(2).text()).to.equal('after1');
    });
});

