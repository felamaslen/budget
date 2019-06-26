import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '~client/actions/graph.actions';
import { getFundsCachedValue, getFundsCost } from '~client/selectors/funds';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import GraphFunds from '~client/containers/GraphFunds';

function ListHeadFundsMobile({ totalCost, shortPeriod, cachedValue, onReloadPrices }) {
    const onReload = useCallback(() => onReloadPrices(shortPeriod), [shortPeriod, onReloadPrices]);
    const { value, ageText } = cachedValue;
    const gain = totalCost
        ? (value - totalCost) / totalCost
        : 0;

    const className = classNames('gain', {
        profit: gain > 0,
        loss: gain < 0
    });

    return (
        <div className="funds-info-inner">
            <div className={className} onClick={onReload}>
                <span className="gain-info">{'Current value:'}</span>
                <span className="value">{formatCurrency(value)}</span>
                <span className="gain-pct">{formatPercent(gain, { brackets: true, precision: 2 })}</span>
                <span className="cache-age">({ageText})</span>
            </div>
            <GraphFunds isMobile={true} />
        </div>
    );
}

ListHeadFundsMobile.propTypes = {
    totalCost: PropTypes.number.isRequired,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    totalCost: getFundsCost(state),
    shortPeriod: state.other.graphFunds.period,
    cachedValue: getFundsCachedValue(state)
});

const mapDispatchToProps = dispatch => ({
    onReloadPrices: shortPeriod => dispatch(aFundsGraphPeriodChanged({ shortPeriod, noCache: true }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListHeadFundsMobile);
