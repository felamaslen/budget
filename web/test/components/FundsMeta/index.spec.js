/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import '~client-test/browser.js';
import React from 'react';
import { shallow } from 'enzyme';
import FundsMeta from '~client/components/FundsMeta';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';
import StocksList from '~client/containers/StocksList';
import GraphFunds from '~client/containers/GraphFunds';

describe('<FundsMeta />', () => {
    const wrapper = shallow(<FundsMeta page="funds" />);

    it('should render a media query to switch between mobile and desktop', () => {
        expect(wrapper.is('div.funds-info')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is(Media)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.have.property('query', mediaQueryMobile);
    });

    it('should render an after list section on desktop', () => {
        const afterList = shallow(wrapper.childAt(0).props().children(false));

        expect(afterList.is('div.after-list')).to.equal(true);
        expect(afterList.children()).to.have.length(2);
        expect(afterList.childAt(0).is(StocksList)).to.equal(true);
        expect(afterList.childAt(1).is(GraphFunds)).to.equal(true);
    });
});

