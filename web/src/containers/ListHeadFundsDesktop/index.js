import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '~client/actions/graph.actions';
import { aFundsViewSoldToggled } from '~client/actions/content.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { getFundsCachedValue, getFundsCost } from '~client/selectors/funds';

const formatOptions = { brackets: true, precision: 2 };

function ListHeadFundsDesktop({ totalCost, viewSoldFunds, shortPeriod, cachedValue, onReloadPrices, onViewSoldToggle }) {

    let gainValues = null;
    const { ageText, value: currentValue } = cachedValue;
    const gainAbsValue = currentValue - totalCost;

    const profitClass = { profit: gainAbsValue > 0, loss: gainAbsValue < 0 };

    if (totalCost) {
        const gainPctValue = gainAbsValue / totalCost;

        gainValues = (
            <span className="gain-values">
                <span className="gain-pct">{formatPercent(gainPctValue, formatOptions)}</span>
                <span className="gain-abs">{formatCurrency(gainAbsValue, formatOptions)}</span>
            </span>
        );
    }

    const className = classNames('overall-gain', profitClass);

    const gainSpan = (
        <span className={className} onClick={onReloadPrices(shortPeriod)}>
            <span className="value">{formatCurrency(currentValue)}</span>
            {gainValues}
            <span className="cache-age">({ageText})</span>
        </span>
    );

    return (
        <>
            {gainSpan}
            <span className="toggle-view-sold">
                <input type="checkbox"
                    checked={viewSoldFunds}
                    onChange={onViewSoldToggle}
                />
                <span>{'View sold'}</span>
            </span>
        </>
    );
}

ListHeadFundsDesktop.propTypes = {
    totalCost: PropTypes.number.isRequired,
    viewSoldFunds: PropTypes.bool,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
    totalCost: getFundsCost(state),
    viewSoldFunds: state.other.viewSoldFunds,
    shortPeriod: state.other.graphFunds.period,
    cachedValue: getFundsCachedValue(state, props)
});

const mapDispatchToProps = dispatch => ({
    onViewSoldToggle: () => dispatch(aFundsViewSoldToggled()),
    onReloadPrices: shortPeriod => () => dispatch(aFundsGraphPeriodChanged({ shortPeriod, noCache: true }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListHeadFundsDesktop);
