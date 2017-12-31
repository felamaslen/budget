/* eslint-disable no-unused-expressions */
import { fromJS } from 'immutable';
import 'babel-polyfill';
import '../../browser';
import chai, { expect } from 'chai';
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme());
import { mount } from 'enzyme';
import React from 'react';
import BlockBits from '../../../src/components/block-packer/block-bits';

describe('BlockBits />', () => {
    const onHover = () => null;

    let clicked = null;
    const onClick = (...args) => {
        clicked = args;
    };

    const props = {
        page: 'page1',
        block: fromJS({
            name: 'foo',
            color: 'red',
            blocks: [],
            width: 11,
            height: 13
        }),
        activeMain: false,
        activeSub: false,
        onHover,
        onClick
    };

    const wrapper = mount(<BlockBits {...props} />);
    const wrapperWasDeep = mount(<BlockBits {...props} deepBlock="foo" />);

    it('should render its basic structure', () => {
        expect(wrapper.hasClass('block')).to.equal(true);
        expect(wrapper.hasClass('block-foo')).to.equal(true);
        expect(wrapper.hasClass('active')).to.equal(false);
        expect(wrapperWasDeep.hasClass('block-foo')).to.equal(false);
    });
    it('should render block width and height', () => {
        expect(wrapper).to.have.style('width', '11px');
        expect(wrapper).to.have.style('height', '13px');
    });
    it('should accept an onClick handler', () => {
        wrapper.simulate('click');
        expect(clicked).to.deep.equal([{ page: 'page1', name: 'foo', wasDeep: false }]);

        wrapperWasDeep.simulate('click');
        expect(clicked).to.deep.equal([{ page: 'page1', name: 'foo', wasDeep: true }]);
    });

    it('should add colour class', () => {
        expect(wrapper.hasClass('block-red')).to.equal(true);
    });
});

