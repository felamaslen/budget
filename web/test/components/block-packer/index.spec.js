/* eslint-disable no-unused-expressions */
import { List as list } from 'immutable'
import { expect } from 'chai'
import 'babel-polyfill'
import React from 'react'
import { shallow } from 'enzyme'
import '../../browser'

import BlockPacker from '../../../src/components/block-packer'
import Blocks from '../../../src/components/block-packer/blocks'

describe('<BlockPacker />', () => {
    let clicked = false
    let hovered = false
    const onClick = () => {
        clicked = true
    }
    const onHover = (...args) => {
        hovered = args
    }

    const props = {
        pageIndex: 0,
        blocks: list([1, 2, 3]),
        activeBlock: [0, 1],
        deepBlock: 'foo',
        status: 'bar',
        onClick,
        onHover
    }

    const wrapper = shallow(<BlockPacker {...props} />)

    it('should render its basic structure', () => {
        expect(wrapper.name()).to.equal('div')
        expect(wrapper.hasClass('block-view')).to.be.ok
        expect(wrapper.children()).to.have.length(2)

        const blockTreeOuter = wrapper.childAt(0)
        expect(blockTreeOuter.name()).to.equal('div')
        expect(blockTreeOuter.hasClass('block-tree-outer')).to.be.ok

        const statusBarOuter = wrapper.childAt(1)
        expect(statusBarOuter.name()).to.equal('div')
        expect(statusBarOuter.hasClass('status-bar')).to.be.ok
    })

    it('should render blocks', () => {
        expect(wrapper.childAt(0).children()).to.have.length(1)
        expect(wrapper.childAt(0).childAt(0)
            .name()).to.equal('Blocks')
    })

    it('should render a status bar', () => {
        expect(wrapper.childAt(1).children()).to.have.length(1)

        const inner = wrapper.childAt(1).childAt(0)
        expect(inner.name()).to.equal('span')
        expect(inner.hasClass('inner')).to.be.ok
        expect(inner.text()).to.equal('bar')
    })
})

