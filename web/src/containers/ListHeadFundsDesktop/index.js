import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '../../actions/graph.actions';
import { aFundsViewSoldToggled } from '../../actions/content.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '../../helpers/format';
import { getFundsCachedValue, getFundsCost } from '../../selectors/funds';

function ListHeadFundsDesktop({ totalCost, viewSoldFunds, shortPeriod, cachedValue, onReloadPrices, onViewSoldToggle }) {

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

    const gainSpan = (
        <span className={className} onClick={onReloadPrices(shortPeriod)}>
            <span className="value">{formatCurrency(currentValue)}</span>
            {gainValues}
            <span className="cache-age">({cachedValue.get('ageText')})</span>
        </span>
    );

    return (
        <React.Fragment>
            {gainSpan}
            <span className="toggle-view-sold">
                <input type="checkbox"
                    checked={viewSoldFunds}
                    onClick={onViewSoldToggle}
                />
                <span>{'View sold'}</span>
            </span>
        </React.Fragment>
    );
}

ListHeadFundsDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    totalCost: PropTypes.number.isRequired,
    viewSoldFunds: PropTypes.bool,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: PropTypes.instanceOf(map).isRequired,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
    totalCost: getFundsCost(state),
    viewSoldFunds: state.getIn(['other', 'viewSoldFunds']),
    shortPeriod: state.getIn(['other', 'graphFunds', 'period']),
    cachedValue: getFundsCachedValue(state, props)
});

const mapDispatchToProps = dispatch => ({
    onViewSoldToggle: () => dispatch(aFundsViewSoldToggled()),
    onReloadPrices: shortPeriod => () => dispatch(aFundsGraphPeriodChanged({ shortPeriod, noCache: true }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListHeadFundsDesktop);

