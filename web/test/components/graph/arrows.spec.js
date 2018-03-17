/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { shallow } from 'enzyme';
import React from 'react';
import ArrowLine, { Arrow } from '../../../src/components/graph/arrows';

describe('<ArrowLine />', () => {
    const points = [
        [0, 5],
        [1, 4.5],
        [2, 2.3],
        [3, -1.2]
    ];

    const props = {
        data: fromJS(points),
        color: 'black',
        minY: -5,
        maxY: 10,
        pixX: xv => xv * 5 + 1,
        pixY: yv => yv * 10 + 2
    };

    const wrapper = shallow(<ArrowLine {...props} />);

    it('should render a list of arrow SVG paths', () => {
        expect(wrapper.is('g')).to.equal(true);
        expect(wrapper.children()).to.have.length(4);
    });

    it.each(points, 'should render the paths as Arrow components', ([index]) => {
        const child = wrapper.childAt(index);

        expect(child.is(Arrow)).to.equal(true);
    });

    const paths = [
        [1, 2, 1, 57, 1.5, 'M-5.0 62.0 L1.0 52.0 L7.0 62.0 L1.0 59.0 Z'],
        [6, 2, 6, 51.75, 1.35, 'M0.3 56.5 L6.0 47.0 L11.7 56.5 L6.0 53.6 Z'],
        [11, 2, 11, 28.65, 0.69, 'M6.6 32.3 L11.0 25.0 L15.4 32.3 L11.0 30.1 Z'],
        [16, 2, 16, -13.7, 0.72, 'M11.6 -17.4 L16.0 -10.0 L20.4 -17.4 L16.0 -15.2 Z']
    ];

    it.each(points, 'should render the correct paths for each arrow', ([index]) => {
        const child = wrapper.childAt(index);

        const arrowProps = child.props();
        const wrapperArrow = shallow(<Arrow {...arrowProps} />);

        expect(wrapperArrow.is('g')).to.equal(true);
        expect(wrapperArrow.children()).to.have.length(2);

        expect(wrapperArrow.childAt(0).is('line')).to.equal(true);
        expect(wrapperArrow.childAt(0).props()).to.deep.equal({
            x1: paths[index][0],
            y1: paths[index][1],
            x2: paths[index][2],
            y2: paths[index][3],
            stroke: 'black',
            strokeWidth: paths[index][4]
        });

        expect(wrapperArrow.childAt(1).is('path')).to.equal(true);
        expect(wrapperArrow.childAt(1).props()).to.deep.equal({
            'd': paths[index][5],
            stroke: 'none',
            fill: 'black'
        });
    });
});

