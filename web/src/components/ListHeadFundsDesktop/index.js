import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '../../helpers/format';

function ListHeadExtraFunds({ totalCost, shortPeriod, cachedValue, onReloadPrices }) {
    const gain = totalCost
        ? (cachedValue.get('value') - totalCost) / totalCost
        : 0;

    const className = classNames('gain', {
        profit: gain > 0,
        loss: gain < 0
    });

    return <span className={className} onClick={onReloadPrices(shortPeriod)}>
        <span className="gain-info">{'Current value:'}</span>
        <span className="value">{formatCurrency(cachedValue.get('value'))}</span>
        <span className="gain-pct">{formatPercent(gain, { brackets: true, precision: 2 })}</span>
        <span className="cache-age">({cachedValue.get('ageText')})</span>
    </span>;
}

ListHeadExtraFunds.propTypes = {
    page: PropTypes.string.isRequired,
    totalCost: PropTypes.number.isRequired,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: PropTypes.instanceOf(map).isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    totalCost: state.getIn(['pages', 'funds', 'data', 'total']),
    shortPeriod: state.getIn(['other', 'graphFunds', 'period']),
    cachedValue: state.getIn(['other', 'fundsCachedValue'])
});

const mapDispatchToProps = dispatch => ({
    onReloadPrices: shortPeriod => () => dispatch(aFundsGraphPeriodChanged({
        shortPeriod, noCache: true, reloadPagePrices: true
    }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListHeadExtraFunds);

