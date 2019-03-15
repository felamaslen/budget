import './style.scss';
import { OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { getProcessedFundsRows } from '~client/selectors/funds';
import React from 'react';
import PropTypes from 'prop-types';
import PageList from '../PageList';
import FundsMeta from '~client/components/FundsMeta';
import ListHeadFundsDesktop from '../ListHeadFundsDesktop';
import ListRowFundsDesktop from '~client/components/ListRowFundsDesktop';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';

function PageFunds({ rows }) {
    return (
        <PageList page="funds"
            After={FundsMeta}
            TotalValue={ListHeadFundsDesktop}
            AfterRow={ListRowFundsDesktop}
            AfterRowMobile={ListRowFundsMobile}
            listColsMobile={['item']}
            rows={rows}
        />
    );
}

PageFunds.propTypes = {
    rows: PropTypes.instanceOf(OrderedMap)
};

const mapStateToProps = state => ({
    rows: getProcessedFundsRows(state)
});

export default connect(mapStateToProps)(PageFunds);

