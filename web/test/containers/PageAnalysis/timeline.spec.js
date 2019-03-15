/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';
import chai, { expect } from 'chai';
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme());
import itEach from 'it-each';
itEach();
import React from 'react';
import Timeline from '~client/containers/PageAnalysis/timeline';

describe('Analysis page <Timeline />', () => {
    const timeline = [
        [1, 5, 3, 9],
        [93, 10, 24, 40],
        [43, 19, 33.2, 10],
        [9, 23.5, 52, 1],
        [40, 3, 1, 20]
    ];

    const props = {
        data: fromJS(timeline)
    };

    const wrapper = shallow(<Timeline {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.timeline-outer')).to.equal(true);
        expect(wrapper.children()).to.have.length(5);
    });

    let key = null;
    before(() => {
        key = 0;
    });

    it.each([
        { color: 'rgb(211,231,227)' },
        { color: 'rgb(218,209,209)' },
        { color: 'rgb(215,213,214)' },
        { color: 'rgb(204,219,223)' },
        { color: 'rgb(224,213,211)' }
    ], 'should render the timeline', ({ color }) => {
        expect(wrapper.childAt(key).is('span.data-item')).to.equal(true);
        expect(wrapper.childAt(key)).to.have.style('background-color', color);

        key++;
    });
});

