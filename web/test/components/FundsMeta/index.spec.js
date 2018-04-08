/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import { fromJS } from 'immutable';
import itEach from 'it-each';
itEach();
import '../../browser';
import React from 'react';
import { shallow } from 'enzyme';
import shallowWithStore from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import FundsMeta from '../../../src/components/FundsMeta';
import Media from 'react-media';
import { mediaQueries } from '../../../src/constants';
import StocksList from '../../../src/containers/StocksList';
import GraphFunds from '../../../src/containers/GraphFunds';
import ListHeadFundsMobile from '../../../src/containers/ListHeadFundsMobile';

describe('<FundsMeta />', () => {
    const wrapper = shallow(<FundsMeta page="funds" />);

    it('should render a media query to switch between mobile and desktop', () => {
        expect(wrapper.is('div.funds-info')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is(Media)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.have.property('query', mediaQueries.mobile);
    });

    it('should render an after list section on desktop', () => {
        const afterList = shallow(wrapper.childAt(0).props().children(false));

        expect(afterList.is('div.after-list')).to.equal(true);
        expect(afterList.children()).to.have.length(2);
        expect(afterList.childAt(0).is(StocksList)).to.equal(true);
        expect(afterList.childAt(1).is(GraphFunds)).to.equal(true);
    });

    it('should render a mobile component on mobile', () => {
        const store = createMockStore(fromJS({
            pages: {
                funds: {
                    data: {
                        total: 0
                    }
                }
            },
            other: {
                graphFunds: {
                    period: 'foo'
                },
                fundsCachedValue: {}
            }
        }));

        const mobileComponent = shallowWithStore(wrapper.childAt(0).props().children(true), store).dive();

        const compare = shallowWithStore(<ListHeadFundsMobile />, store);

        expect(mobileComponent.html()).to.equal(compare.html());
    });
});

