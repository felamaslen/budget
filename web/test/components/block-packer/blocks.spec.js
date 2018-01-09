/* eslint-disable no-unused-expressions, newline-per-chained-call */
import 'babel-polyfill';
import { fromJS } from 'immutable';
import chai, { expect } from 'chai';
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme());
import { shallow } from 'enzyme';
import '../../browser';
import React from 'react';
import Blocks, { OuterBlockGroup } from '../../../src/components/block-packer/blocks';
import BlockBits from '../../../src/components/block-packer/block-bits';

describe('<OuterBlockGroup />', () => {
    const props = {
        page: 'page1',
        group: fromJS({
            width: 10.4,
            height: 11.5,
            value: 5,
            bits: [
                {
                    name: 'foo',
                    value: 5.1,
                    blocks: [
                        {
                            bits: [
                                { name: 'foo1' }
                            ]
                        }
                    ]
                },
                {
                    name: 'bar',
                    value: 5.2,
                    blocks: [
                        {
                            bits: [
                                { name: 'bar1' }
                            ]
                        }
                    ]
                }
            ]
        }),
        activeMain: true,
        activeSub: false,
        activeBlock: [1, 0],
        onHover: () => null,
        onClick: () => null
    };

    const wrapper = shallow(<OuterBlockGroup {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.block-group')).to.equal(true);
    });
    it('should render the block width and height', () => {
        expect(wrapper).to.have.style('width', '10.4px');
        expect(wrapper).to.have.style('height', '11.5px');
    });
    it('should render the block\'s bits', () => {
        expect(wrapper.children()).to.have.length(2);

        expect(wrapper.childAt(0).is(BlockBits)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            block: props.group.getIn(['bits', 0]),
            activeMain: true,
            activeSub: false,
            activeBlock: [1, 0]
        });

        expect(wrapper.childAt(1).props()).to.deep.include({
            block: props.group.getIn(['bits', 1]),
            activeMain: true,
            activeSub: false,
            activeBlock: [1, 0]
        });
    });
});

describe('<Blocks />', () => {
    const props = {
        blocks: fromJS([
            {
                width: 10,
                height: 10,
                bits: [
                    {
                        name: 'foo',
                        blocks: [
                            {
                                bits: [
                                    { name: 'foo1' }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'bar',
                        blocks: [
                            {
                                bits: [
                                    { name: 'bar1' }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                width: 3,
                height: 7,
                bits: [
                    { name: 'baz', blocks: [] }
                ]
            }
        ]),
        activeBlock: null,
        page: 'page1',
        onClick: () => null,
        onHover: () => null
    };

    const wrapper = shallow(<Blocks {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.block-tree')).to.equal(true);
        expect(wrapper.hasClass('block-tree-deep')).to.equal(false);
        expect(wrapper.children()).to.have.length(2);
    });

    it('should render a list of blocks', () => {
        expect(wrapper.childAt(0).is(OuterBlockGroup)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            group: props.blocks.get(0),
            activeMain: false,
            activeSub: false,
            activeBlock: null
        });

        expect(wrapper.childAt(1).is(OuterBlockGroup)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.deep.include({
            group: props.blocks.get(1),
            activeMain: false,
            activeSub: false,
            activeBlock: null
        });
    });

    it('should accept an active main block', () => {
        const activeMainProps = { ...props, activeBlock: [0] };
        const activeWrapper = shallow(<Blocks {...activeMainProps} />);

        expect(activeWrapper.childAt(0).props()).to.have.property('activeMain', true);
        expect(activeWrapper.childAt(0).props()).to.have.property('activeSub', false);
    });
    it('should accept an active sub block', () => {
        const activeSubProps = { ...props, activeBlock: [0, 0] };
        const activeWrapper = shallow(<Blocks {...activeSubProps} />);

        expect(activeWrapper.childAt(0).props()).to.have.property('activeMain', false);
        expect(activeWrapper.childAt(0).props()).to.have.property('activeSub', true);
    });

    it('should accept a deepBlock prop', () => {
        const deepBlockProps = { ...props, deepBlock: 'foo' };
        const deepWrapper = shallow(<Blocks {...deepBlockProps} />);

        expect(deepWrapper.hasClass('block-tree-deep')).to.equal(true);
        expect(deepWrapper.hasClass('block-tree-foo')).to.equal(true);
    });
});

