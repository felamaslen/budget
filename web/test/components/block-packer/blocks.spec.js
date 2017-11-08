/* eslint-disable no-unused-expressions, newline-per-chained-call */
import 'babel-polyfill'
import { fromJS } from 'immutable'
import chai, { expect } from 'chai'
import chaiEnzyme from 'chai-enzyme'
chai.use(chaiEnzyme())
import { mount } from 'enzyme'
import '../../browser'
import React from 'react'
import Blocks from '../../../src/components/block-packer/blocks'

describe('<Blocks />', () => {
    const onClick = () => null
    const onHover = () => null

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
        pageIndex: 1,
        onClick,
        onHover
    }

    const wrapper = mount(<Blocks {...props} />)

    it('should render its basic structure', () => {
        expect(wrapper.name()).to.equal('Blocks')
        expect(wrapper.hasClass('block-tree')).to.be.ok
        expect(wrapper.hasClass('block-tree-deep')).to.be.false

        const blocks = wrapper.children()
        expect(blocks).to.have.length(2)
        expect(blocks.at(0).name()).to.equal('div')
        expect(blocks.at(0).hasClass('block-group')).to.be.ok
    })

    it('should render each group inside each block', () => {
        expect(wrapper.childAt(0).children()).to.have.length(2)
        expect(wrapper.childAt(0).childAt(0).name()).to.equal('BlockBits')
    })

    it('should put width / height attributes on each block', () => {
        expect(wrapper.childAt(0)).to.have.style('width', '10px')
    })

    it('should accept an active main block', () => {
        const activeMainProps = { ...props, activeBlock: [0] }
        const mounted = mount(<Blocks {...activeMainProps} />)

        expect(mounted.childAt(0).childAt(0).props()).to.have.property('activeMain', true)
        expect(mounted.childAt(0).childAt(0).props()).to.have.property('activeSub', false)
    })
    it('should accept an active sub block', () => {
        const activeSubProps = { ...props, activeBlock: [0, 0] }
        const mounted = mount(<Blocks {...activeSubProps} />)

        expect(mounted.childAt(0).childAt(0).props()).to.have.property('activeMain', false)
        expect(mounted.childAt(0).childAt(0).props()).to.have.property('activeSub', true)
    })

    it('should accept a deepBlock prop', () => {
        const deepBlockProps = { ...props, deepBlock: 'foo' }
        const mounted = mount(<Blocks {...deepBlockProps} />)

        expect(mounted.hasClass('block-tree-deep')).to.be.ok
        expect(mounted.hasClass('block-tree-foo')).to.be.ok
    })
})
