/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import '~client-test/browser.js';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { shallow } from 'enzyme';
import React from 'react';
import ArrowLine from '~client/components/Graph/ArrowLine';
import Arrow from '~client/components/Arrow';

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
});

