/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { shallow } from 'enzyme';
import React from 'react';
import NumberInputPad from '../../../src/components/LoginForm/number-input-pad';
import Digit from '../../../src/components/LoginForm/digit';

describe('<NumberInputPad />', () => {
    let input = false;
    const onInput = () => {
        input = true;
    };

    const props = {
        onInput
    };

    const wrapper = shallow(<NumberInputPad {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.number-input.noselect')).to.equal(true);
        expect(wrapper.children()).to.have.length(4);
    });

    beforeEach(() => {
        input = false;
    });

    describe('digits 1-3', () => {
        it('should be rendered', () => {
            expect(wrapper.childAt(0).is('div.number-input-row')).to.equal(true);
            expect(wrapper.childAt(0).children()).to.have.length(3);
        });

        let key = 0;

        it.each([1, 2, 3], 'should work', digit => {
            expect(wrapper.childAt(0).childAt(key).is(Digit)).to.equal(true);
            expect(wrapper.childAt(0).childAt(key).props()).to.have.property('digit', digit);

            expect(input).to.equal(false);
            wrapper.childAt(0).childAt(key).props().onInput();
            expect(input).to.equal(true);

            key++;
            input = false;
        });
    });

    describe('digits 4-6', () => {
        it('should be rendered', () => {
            expect(wrapper.childAt(1).is('div.number-input-row')).to.equal(true);
            expect(wrapper.childAt(1).children()).to.have.length(3);
        });

        let key = 0;

        it.each([4, 5, 6], 'should work', digit => {
            expect(wrapper.childAt(1).childAt(key).is(Digit)).to.equal(true);
            expect(wrapper.childAt(1).childAt(key).props()).to.have.property('digit', digit);

            expect(input).to.equal(false);
            wrapper.childAt(1).childAt(key).props().onInput();
            expect(input).to.equal(true);

            key++;
            input = false;
        });
    });

    describe('digits 7-9', () => {
        it('should be rendered', () => {
            expect(wrapper.childAt(2).is('div.number-input-row')).to.equal(true);
            expect(wrapper.childAt(2).children()).to.have.length(3);
        });

        beforeEach(() => {
            input = false;
        });

        let key = 0;

        it.each([7, 8, 9], 'should work', digit => {
            expect(wrapper.childAt(2).childAt(key).is(Digit)).to.equal(true);
            expect(wrapper.childAt(2).childAt(key).props()).to.have.property('digit', digit);

            expect(input).to.equal(false);
            wrapper.childAt(2).childAt(key).props().onInput();
            expect(input).to.equal(true);

            key++;
            input = false;
        });
    });

    describe('digit 0', () => {
        it('should be rendered', () => {
            expect(wrapper.childAt(3).is('div.number-input-row')).to.equal(true);
            expect(wrapper.childAt(3).children()).to.have.length(1);
        });

        it('should work', () => {
            expect(wrapper.childAt(3).childAt(0).is(Digit)).to.equal(true);
            expect(wrapper.childAt(3).childAt(0).props()).to.have.property('digit', 0);

            expect(input).to.equal(false);
            wrapper.childAt(3).childAt(0).props().onInput();
            expect(input).to.equal(true);
        });
    });
});

