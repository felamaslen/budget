/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import LineGraphDumb from '../../../src/components/Graph/LineGraphDumb';

describe('<LineGraphDumb />', () => {
    const props = {
        width: 200,
        height: 100,
        lines: fromJS([
            {
                key: 'line1',
                data: [
                    [100, 1],
                    [101, 2],
                    [102, -1],
                    [103, 0]
                ],
                smooth: false,
                color: 'black'
            },
            {
                key: 'line2',
                data: [
                    [100, 1],
                    [101, 2],
                    [102, -1],
                    [103, 0]
                ],
                smooth: true,
                color: 'black',
                strokeWidth: 1.5
            },
            {
                key: 'line3',
                data: [
                    [100, 1]
                ],
                smooth: false,
                color: 'black'
            },
            {
                key: 'line4',
                data: [
                    [100, 1]
                ],
                smooth: false,
                color: 'black'
            },
            {
                key: 'line5',
                data: [
                    [100, 1],
                    [102, 2]
                ],
                smooth: true,
                color: 'black'
            }
        ]),
        calc: {
            minX: 100,
            maxX: 103,
            minY: -2,
            maxY: 2,
            pixX: () => 0,
            pixY: () => 0,
            valX: () => 0,
            valY: () => 0
        }
    };

    const wrapper = mount(<LineGraphDumb {...props} />);

    it('should render a line graph', () => {
        expect(wrapper.is(LineGraphDumb)).to.equal(true);
        expect(wrapper.children()).to.have.length(1);

        const graph = wrapper.childAt(0);

        expect(graph.name()).to.equal('Graph');
    });
});


