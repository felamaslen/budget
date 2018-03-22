/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import '../../../browser';
import React from 'react';
import { shallow } from 'enzyme';
import AfterList, { AfterListFunds } from '../../../../src/containers/page/list/after-list';
import Media from 'react-media';
import { mediaQueries } from '../../../../src/constants';
import StocksList from '../../../../src/containers/stocks-list';
import GraphFunds from '../../../../src/containers/page/funds/graph/funds';
import { ListHeadExtraFunds } from '../../../../src/containers/page/list/head/extra';

describe('List page', () => {
    describe('<AfterList />', () => {
        it.each([
            'bills', 'income', 'food', 'general', 'holiday', 'social'
        ], 'should render nothing for most pages', page => {

            const wrapper = shallow(<AfterList page={page} />);

            expect(wrapper.get(0)).to.equal(null);
        });

        it('should render a media queried <AfterListFunds /> for the funds page', () => {
            const wrapper = shallow(<AfterList page="funds" />);

            expect(wrapper.is('div.funds-info')).to.equal(true);
            expect(wrapper.children()).to.have.length(1);
            expect(wrapper.childAt(0).is(Media)).to.equal(true);
            expect(wrapper.childAt(0).props()).to.have.property('query', mediaQueries.mobile);
        });
    });

    describe('<AfterListFunds />', () => {
        it('should render its basic structure (desktop)', () => {
            const wrapper = shallow(<AfterListFunds isMobile={false} />);

            expect(wrapper.is('span.after-list')).to.equal(true);
            expect(wrapper.children()).to.have.length(2);
            expect(wrapper.childAt(0).is(StocksList)).to.equal(true);
            expect(wrapper.childAt(1).is(GraphFunds)).to.equal(true);
        });

        it('shoud render its basic structure (mobile)', () => {
            const wrapper = shallow(<AfterListFunds isMobile={true} />);

            expect(wrapper.is(ListHeadExtraFunds)).to.equal(true);
        });
    });
});

