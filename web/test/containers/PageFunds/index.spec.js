import { fromJS } from 'immutable';
import shallow from '../../shallow-with-store';
import { expect } from 'chai';
import '~client-test/browser.js';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import PageFunds from '~client/containers/PageFunds';
import PageList from '~client/containers/PageList';
import FundsMeta from '~client/components/FundsMeta';
import ListHeadFundsDesktop from '~client/containers/ListHeadFundsDesktop';
import ListRowFundsDesktop from '~client/components/ListRowFundsDesktop';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';

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

