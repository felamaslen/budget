/* eslint-disable no-unused-expressions */
import { fromJS } from 'immutable';
import 'babel-polyfill';
import '../../browser';
import chai, { expect } from 'chai';
import itEach from 'it-each';
itEach();
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme());
import { shallow } from 'enzyme';
import React from 'react';
import BlockBits, { BlockGroup, SubBlock } from '../../../src/components/BlockPacker/block-bits';

describe('<SubBlock />', () => {
    const props = {
        name: 'foo',
        value: 101.5,
        subBlock: fromJS({
            name: 'bar',
            width: 90,
            height: 87
        }),
        activeSub: false,
        activeBlock: [],
        onHover: () => null
    };

    const wrapper = shallow(<SubBlock {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.sub-block')).to.equal(true);
        expect(wrapper).to.have.style('width', '90px');
        expect(wrapper).to.have.style('height', '87px');
    });
});

describe('<BlockGroup />', () => {
    const props = {
        name: 'foo',
        value: 987,
        activeSub: false,
        onHover: () => null,
        group: fromJS({
            bits: [
                { foo: 'bar' },
                { bar: 'baz' }
            ],
            width: 15,
            height: 13
        })
    };

    const wrapper = shallow(<BlockGroup {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.block-group')).to.equal(true);
        expect(wrapper).to.have.style('width', '15px');
        expect(wrapper).to.have.style('height', '13px');
    });

    it('should render block bits', () => {
        expect(wrapper.children()).to.have.length(2);
    });
});

describe('<BlockBits />', () => {
    const props = {
        block: fromJS({
            name: 'foo',
            value: 1001.3,
            color: 'red',
            blocks: [{ foo: 'bar' }, { bar: 'baz' }],
            width: 11,
            height: 13
        }),
        page: 'page1',
        activeMain: false,
        activeSub: false,
        activeBlock: [],
        onHover: () => null,
        onClick: () => null
    };

    const wrapper = shallow(<BlockBits {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.block.block-red')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
    });

    let key = null;
    before(() => {
        key = 0;
    });
    after(() => {
        key = 0;
    });

    it.each(props.block.get('blocks').toJS(), 'should render a list of blocks', group => {
        expect(wrapper.childAt(key).is(BlockGroup)).to.equal(true);
        expect(wrapper.childAt(key).props()).to.deep.include({
            activeBlock: [],
            name: 'foo',
            value: 1001.3,
            group: fromJS(group)
        });

        key++;
    });
});

