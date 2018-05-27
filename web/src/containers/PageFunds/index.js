import './style.scss';
import { OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PageList from '../PageList';
import FundsMeta from '../../components/FundsMeta';
import { PAGES } from '../../constants/data';
import ListHeadFundsDesktop from '../../containers/ListHeadFundsDesktop';
import ListRowFundsDesktop from '../../components/ListRowFundsDesktop';
import ListRowFundsMobile from '../../components/ListRowFundsMobile';

function PageFunds({ sold }) {
    const rowClasses = sold.map(value => ({ sold: value }));

    return (
        <PageList page="funds"
            After={FundsMeta}
            TotalValue={ListHeadFundsDesktop}
            AfterRow={ListRowFundsDesktop}
            AfterRowMobile={ListRowFundsMobile}
            listColsMobile={['item']}
            rowClasses={rowClasses}
        />
    );
}

PageFunds.propTypes = {
    sold: ImmutablePropTypes.map.isRequired
};

const transactionsKey = PAGES.funds.cols.indexOf('transactions');

const getFundRows = state => state.getIn(['pages', 'funds', 'rows']) || OrderedMap.of();

const selectSold = createSelector([getFundRows], rows =>
    rows.map(item => item.getIn(['cols', transactionsKey]).isSold()));

const mapStateToProps = state => ({
    sold: selectSold(state)
});

export default connect(mapStateToProps)(PageFunds);

