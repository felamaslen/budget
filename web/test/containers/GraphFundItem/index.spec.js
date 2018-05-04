/* eslint-disable newline-per-chained-call, id-length */
import { fromJS } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { mount } from 'enzyme';
import React from 'react';
import { GraphFundItem } from '../../../src/containers/GraphFundItem';
import { AverageLine } from '../../../src/components/Graph/LineGraph';

describe('<GraphFundItem />', () => {
    const props = {
        id: 3,
        data: fromJS([
            [100, 42.3],
            [101, 41.2],
            [102, 45.9],
            [102.5, 46.9],
            [103, 0],
            [104, 47.1],
            [105, 46.9],
            [106, 42.5]
        ]),
        popout: true,
        onToggle: () => null
    };

    const wrapper = mount(<GraphFundItem {...props} />);

    it('should render a graph with the correct paths', () => {
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).name()).to.equal('svg');
        expect(wrapper.childAt(0).children()).to.have.length(3);

        expect(wrapper.childAt(0).childAt(1).name()).to.equal('RenderedLine');
        expect(wrapper.childAt(0).childAt(1).children()).to.have.length(4);
        expect(wrapper.childAt(0).childAt(1).childAt(0).is(AverageLine)).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).childAt(1).name()).to.equal('path');
        expect(wrapper.childAt(0).childAt(1).childAt(1).props()).to.deep.equal({
            'd': 'M0.0,97.6 Q18,94 25.0,97.6',
            fill: 'none',
            stroke: 'rgb(0,204,51)',
            strokeWidth: 1.5
        });
        expect(wrapper.childAt(0).childAt(1).childAt(2).name()).to.equal('path');
        expect(wrapper.childAt(0).childAt(1).childAt(2).props()).to.deep.equal({
            'd': 'M25.0,97.6 C35,102 41,120 50.0,120.0 C59,120 70,108 75.0,97.6',
            fill: 'none',
            stroke: 'rgb(204,51,0)',
            strokeWidth: 1.5
        });

        expect(wrapper.childAt(0).childAt(2).name()).to.equal('RenderedLine');
        expect(wrapper.childAt(0).childAt(2).children()).to.have.length(3);
        expect(wrapper.childAt(0).childAt(2).childAt(0).is(AverageLine)).to.equal(true);
        expect(wrapper.childAt(0).childAt(2).childAt(1).name()).to.equal('path');
        expect(wrapper.childAt(0).childAt(2).childAt(1).props()).to.deep.equal({
            'd': 'M200.0,0.0 Q216,-1 225.0,0.0',
            fill: 'none',
            stroke: 'rgb(0,204,51)',
            strokeWidth: 1.5
        });
    });

    describe('axes', () => {
        it('should be rendered', () => {
            expect(wrapper.childAt(0).childAt(0).name()).to.equal('Axes');
            expect(wrapper.childAt(0).childAt(0).children()).to.have.length(3);
        });

        it.each([
            [0, 0, 103.5, '42.0p'],
            [1, 0, 63.5, '44.0p'],
            [2, 0, 22.5, '46.0p']
        ], 'should render each tick', ([index, x, y, text]) => {
            expect(wrapper.childAt(0).childAt(0).childAt(index).name()).to.equal('text');
            expect(wrapper.childAt(0).childAt(0).childAt(index).text()).to.equal(text);
            expect(wrapper.childAt(0).childAt(0).childAt(index).props()).to.deep.include({
                color: 'rgb(51,51,51)',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 11,
                x,
                y
            });
        });
    });
});

