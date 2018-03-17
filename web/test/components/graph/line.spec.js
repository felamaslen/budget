/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import LineGraph from '../../../src/components/graph/line';

describe('<LineGraph />', () => {
    const props = {
        width: 200,
        height: 100,
        lines: [
            {
                key: 'line1',
                data: fromJS([
                    [100, 1],
                    [101, 2],
                    [102, -1],
                    [103, 0]
                ]),
                smooth: false,
                color: 'black'
            },
            {
                key: 'line2',
                data: fromJS([
                    [100, 1],
                    [101, 2],
                    [102, -1],
                    [103, 0]
                ]),
                smooth: true,
                color: 'black',
                strokeWidth: 1.5
            },
            {
                key: 'line3',
                data: fromJS([
                    [100, 1]
                ]),
                smooth: false,
                color: 'black'
            },
            {
                key: 'line4',
                data: fromJS([
                    [100, 1]
                ]),
                smooth: false,
                color: 'black'
            },
            {
                key: 'line5',
                data: fromJS([
                    [100, 1],
                    [102, 2]
                ]),
                smooth: true,
                color: 'black'
            }
        ],
        minX: 100,
        maxX: 103,
        minY: -2,
        maxY: 2
    };

    const wrapper = mount(<LineGraph {...props} />);

    it('should render a line graph', () => {
        expect(wrapper.is(LineGraph)).to.equal(true);
        expect(wrapper.children()).to.have.length(1);

        const svg = wrapper.childAt(0);
        expect(svg.is('svg')).to.equal(true);
        expect(svg.children()).to.have.length(5);
    });

    it('should render a simple point-to-point path', () => {
        const line = wrapper.childAt(0).childAt(0);
        expect(line.children()).to.have.length(1);
        const path = line.childAt(0);
        expect(path.props()).to.deep.equal({
            'd': 'M0.0,25.0 L66.7,0.0 L133.3,75.0 L200.0,50.0',
            fill: 'none',
            stroke: 'black',
            strokeWidth: 2
        });
    });

    it('should render a smooth curved path', () => {
        const line = wrapper.childAt(0).childAt(1);
        expect(line.children()).to.have.length(1);
        const path = line.childAt(0);
        expect(path.props()).to.deep.equal({
            'd': 'M0.0,25.0 Q47,-7 66.7,0.0 C94,10 106,65 133.3,75.0 Q153,82 200.0,50.0',
            fill: 'none',
            stroke: 'black',
            strokeWidth: 1.5
        });
    });

    it('should handle a non-smooth path with only one point', () => {
        const line = wrapper.childAt(0).childAt(2);
        expect(line.children()).to.have.length(1);
        const path = line.childAt(0);
        expect(path.props()).to.deep.equal({
            'd': '',
            fill: 'none',
            stroke: 'black',
            strokeWidth: 2
        });
    });

    it('should handle a smooth path with only one point', () => {
        const line = wrapper.childAt(0).childAt(3);
        expect(line.children()).to.have.length(1);
        const path = line.childAt(0);
        expect(path.props()).to.deep.equal({
            'd': '',
            fill: 'none',
            stroke: 'black',
            strokeWidth: 2
        });
    });

    it('should handle a smooth path with two points', () => {
        const line = wrapper.childAt(0).childAt(4);
        expect(line.children()).to.have.length(1);
        const path = line.childAt(0);
        expect(path.props()).to.deep.equal({
            'd': 'M0.0,25.0 L133.3,0.0',
            fill: 'none',
            stroke: 'black',
            strokeWidth: 2
        });
    });
});

