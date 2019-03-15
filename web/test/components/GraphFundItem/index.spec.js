/* eslint-disable newline-per-chained-call, id-length */
import { fromJS } from 'immutable';
import '~client-test/browser.js';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { shallow, mount } from 'enzyme';
import React from 'react';
import GraphFundItem from '~client/components/GraphFundItem';

describe('<GraphFundItem />', () => {
    const props = {
        id: 3,
        values: fromJS([
            [100, 42.3],
            [101, 41.2],
            [102, 45.9],
            [102.5, 46.9],
            [103, 0],
            [104, 47.1],
            [105, 46.9],
            [106, 42.5]
        ]),
        sold: false,
        popout: true,
        onToggle: () => null
    };

    const wrapper = mount(<GraphFundItem {...props} />);

    it('should render a graph with the correct paths', () => {
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).name()).to.equal('LineGraph');

        expect(wrapper.childAt(0).props()).to.deep.include({
            svgClasses: 'popout',
            width: 300,
            height: 120,
            minX: 100,
            maxX: 106,
            minY: 41.2,
            maxY: 47.1
        });

        expect(wrapper.childAt(0).props().lines.toJS()).to.deep.equal([
            {
                key: 0,
                data: [
                    [100, 42.3],
                    [101, 41.2],
                    [102, 45.9],
                    [102.5, 46.9]
                ],
                strokeWidth: 1.5,
                smooth: true,
                color: {
                    changes: [42.3],
                    values: ['rgb(204,51,0)', 'rgb(0,204,51)']
                }
            },
            {
                key: 1,
                data: [
                    [104, 47.1],
                    [105, 46.9],
                    [106, 42.5]
                ],
                strokeWidth: 1.5,
                smooth: true,
                color: {
                    changes: [47.1],
                    values: ['rgb(204,51,0)', 'rgb(0,204,51)']
                }
            }
        ]);
    });

    it('should not render anything if there are no values', () => {
        const propsNoValues = {
            ...props,
            values: null
        };

        const wrapperNoValues = shallow(<GraphFundItem {...propsNoValues} />);

        expect(wrapperNoValues.get(0)).to.equal(null);
    });
});

