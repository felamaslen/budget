import './style.scss';
import { connect } from 'react-redux';
import { getProcessedFundsRows } from '~client/selectors/funds';
import React from 'react';
import { rowsShape } from '~client/prop-types/page/rows';
import { PageList } from '~client/containers/PageList';
import FundsMeta from '~client/components/FundsMeta';
import ListHeadFundsDesktop from '~client/containers/ListHeadFundsDesktop';
import ListRowFundsDesktop from '~client/components/ListRowFundsDesktop';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';

const LIST_COLS_MOBILE_FUNDS = ['item'];

function PageFunds({ rows }) {
    return (
        <PageList page="funds"
            After={FundsMeta}
            TotalValue={ListHeadFundsDesktop}
            AfterRow={ListRowFundsDesktop}
            AfterRowMobile={ListRowFundsMobile}
            listColsMobile={LIST_COLS_MOBILE_FUNDS}
            rows={rows}
        />
    );
}

PageFunds.propTypes = {
    rows: rowsShape
};

const mapStateToProps = state => ({
    rows: getProcessedFundsRows(state)
});

export default connect(mapStateToProps)(PageFunds);
