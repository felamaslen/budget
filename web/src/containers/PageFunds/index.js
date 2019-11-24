import { connect } from 'react-redux';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';

import { mediaQueryMobile } from '~client/constants';

import { fundsViewSoldToggled, fundsRequested } from '~client/actions/funds';
import { getProcessedFundsRows, getFundsCachedValue } from '~client/selectors/funds';
import { rowsShape } from '~client/prop-types/page/rows';
import { cachedValueShape } from '~client/prop-types/page/funds';
import { itemHeightDesktop, itemHeightDesktopFunds } from '~client/styled/variables';
import { PageListBase } from '~client/containers/PageList';
import StocksList from '~client/containers/StocksList';
import GraphFunds from '~client/containers/GraphFunds';
import ListHeadFundsDesktop from '~client/components/ListHeadFundsDesktop';
import ListHeadFundsMobile from '~client/components/ListHeadFundsMobile';
import ListRowFundsDesktop from '~client/components/ListRowFundsDesktop';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';

import * as Styled from './styles';

const LIST_COLS_MOBILE_FUNDS = ['item'];

const FundsInfo = props => (
    <Styled.FundsInfo>
        <Media query={mediaQueryMobile}>
            {isMobile =>
                isMobile ? (
                    <ListHeadFundsMobile {...props} />
                ) : (
                    <div>
                        <StocksList />
                        <GraphFunds isMobile={isMobile} />
                    </div>
                )
            }
        </Media>
    </Styled.FundsInfo>
);

function PageFunds({ rows, cachedValue, period, onViewSoldToggle, onReloadPrices }) {
    const extraProps = useMemo(
        () => ({
            period,
            cachedValue,
            TotalValue: ListHeadFundsDesktop,
            AfterRow: ListRowFundsDesktop,
            AfterRowMobile: ListRowFundsMobile,
            listColsMobile: LIST_COLS_MOBILE_FUNDS,
            onViewSoldToggle,
            onReloadPrices,
        }),
        [period, cachedValue, onViewSoldToggle, onReloadPrices],
    );

    const itemSize = useCallback(
        index => {
            if (rows[index].sold) {
                return itemHeightDesktop;
            }

            return itemHeightDesktopFunds;
        },
        [rows],
    );

    return (
        <Styled.PageFunds>
            <PageListBase
                page="funds"
                itemSize={itemSize}
                After={FundsInfo}
                TotalValue={ListHeadFundsDesktop}
                AfterRow={ListRowFundsDesktop}
                AfterRowMobile={ListRowFundsMobile}
                listColsMobile={LIST_COLS_MOBILE_FUNDS}
                extraProps={extraProps}
                rows={rows}
            />
        </Styled.PageFunds>
    );
}

PageFunds.propTypes = {
    viewSoldFunds: PropTypes.bool.isRequired,
    period: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    rows: rowsShape,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    viewSoldFunds: state.funds.viewSoldFunds,
    period: state.funds.period,
    cachedValue: getFundsCachedValue(state),
    rows: getProcessedFundsRows(state),
});

const mapDispatchToProps = {
    onViewSoldToggle: fundsViewSoldToggled,
    onReloadPrices: () => fundsRequested(false),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PageFunds);
