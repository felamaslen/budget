import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '../../helpers/format';
import { getFundsCachedValue, getFundsCost } from '../../selectors/funds';

function ListHeadFundsDesktop({ totalCost, shortPeriod, cachedValue, onReloadPrices }) {
    let gainValues = null;
    const currentValue = cachedValue.get('value');
    const gainAbsValue = currentValue - totalCost;

    const profitClass = { profit: gainAbsValue > 0, loss: gainAbsValue < 0 };

    if (totalCost) {
        const gainPctValue = gainAbsValue / totalCost;

        const formatOptions = { brackets: true, precision: 2 };

        gainValues = (
            <span className="gain-values">
                <span className="gain-pct">{formatPercent(gainPctValue, formatOptions)}</span>
                <span className="gain-abs">{formatCurrency(gainAbsValue, formatOptions)}</span>
            </span>
        );
    }

    const className = classNames('overall-gain', profitClass);

    return (
        <span className={className} onClick={onReloadPrices(shortPeriod)}>
            <span className="value">{formatCurrency(currentValue)}</span>
            {gainValues}
            <span className="cache-age">({cachedValue.get('ageText')})</span>
        </span>
    );
}

ListHeadFundsDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    totalCost: PropTypes.number.isRequired,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: PropTypes.instanceOf(map).isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
    totalCost: getFundsCost(state),
    shortPeriod: state.getIn(['other', 'graphFunds', 'period']),
    cachedValue: getFundsCachedValue(state, props)
});

const mapDispatchToProps = dispatch => ({
    onReloadPrices: shortPeriod => () => dispatch(aFundsGraphPeriodChanged({ shortPeriod, noCache: true }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListHeadFundsDesktop);

