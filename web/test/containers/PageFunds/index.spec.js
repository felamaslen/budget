import { fromJS } from 'immutable';
import shallow from '../../shallow-with-store';
import { expect } from 'chai';
import '../../browser';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import PageFunds from '../../../src/containers/PageFunds';
import PageList from '../../../src/containers/PageList';
import FundsMeta from '../../../src/components/FundsMeta';
import ListHeadFundsDesktop from '../../../src/containers/ListHeadFundsDesktop';
import ListRowFundsDesktop from '../../../src/components/ListRowFundsDesktop';
import ListRowFundsMobile from '../../../src/components/ListRowFundsMobile';

describe('<PageFunds />', () => {
    it('should render a list page with extra props', () => {
        const state = fromJS({});

        const wrapper = shallow(<PageFunds />, createMockStore(state)).dive();

        expect(wrapper.is(PageList)).to.equal(true);
        expect(wrapper.props()).to.deep.equal({
            page: 'funds',
            After: FundsMeta,
            TotalValue: ListHeadFundsDesktop,
            AfterRow: ListRowFundsDesktop,
            AfterRowMobile: ListRowFundsMobile,
            listColsMobile: ['item'],
            rows: null
        });
    });
});

