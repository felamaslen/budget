import './style.scss';
import { connect } from 'react-redux';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';

import { mediaQueryMobile } from '~client/constants';

import { fundsViewSoldToggled, fundsRequested } from '~client/actions/funds';
import {
    getProcessedFundsRows,
    getFundsCachedValue
} from '~client/selectors/funds';
import { rowsShape } from '~client/prop-types/page/rows';
import { cachedValueShape } from '~client/prop-types/page/funds';
import { PageList } from '~client/containers/PageList';
import StocksList from '~client/containers/StocksList';
import GraphFunds from '~client/containers/GraphFunds';
import ListHeadFundsDesktop from '~client/components/ListHeadFundsDesktop';
import ListHeadFundsMobile from '~client/components/ListHeadFundsMobile';
import ListRowFundsDesktop from '~client/components/ListRowFundsDesktop';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';

const LIST_COLS_MOBILE_FUNDS = ['item'];

const FundsInfo = props => (
    <div className="funds-info">
        <Media query={mediaQueryMobile}>{isMobile => isMobile && (
            <ListHeadFundsMobile {...props} />
        ) || (
            <div className="after-list">
                <StocksList />
                <GraphFunds isMobile={isMobile} />
            </div>
        )}</Media>
    </div>
);

function PageFunds({ rows, cachedValue, period, onViewSoldToggle, onReloadPrices }) {
    const extraProps = useMemo(() => ({
        period,
        cachedValue,
        TotalValue: ListHeadFundsDesktop,
        AfterRow: ListRowFundsDesktop,
        AfterRowMobile: ListRowFundsMobile,
        listColsMobile: LIST_COLS_MOBILE_FUNDS,
        onViewSoldToggle,
        onReloadPrices
    }), [period, cachedValue, onViewSoldToggle, onReloadPrices]);

    return (
        <PageList page="funds"
            After={FundsInfo}
            TotalValue={ListHeadFundsDesktop}
            AfterRow={ListRowFundsDesktop}
            AfterRowMobile={ListRowFundsMobile}
            listColsMobile={LIST_COLS_MOBILE_FUNDS}
            extraProps={extraProps}
            rows={rows}
        />
    );
}

PageFunds.propTypes = {
    viewSoldFunds: PropTypes.bool.isRequired,
    period: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    rows: rowsShape,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    viewSoldFunds: state.funds.viewSoldFunds,
    period: state.funds.period,
    cachedValue: getFundsCachedValue(state),
    rows: getProcessedFundsRows(state)
});

const mapDispatchToProps = {
    onViewSoldToggle: fundsViewSoldToggled,
    onReloadPrices: () => fundsRequested(false)
};

export default connect(mapStateToProps, mapDispatchToProps)(PageFunds);
