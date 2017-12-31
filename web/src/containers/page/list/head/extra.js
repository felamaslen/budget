import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '../../../../misc/format';

function ListHeadExtraFundsComponent({ totalCost, shortPeriod, cachedValue, onReloadPrices }) {
    const gain = totalCost
        ? (cachedValue.get('value') - totalCost) / totalCost
        : 0;

    const className = classNames('gain', {
        profit: gain > 0,
        loss: gain < 0
    });

    return <span className={className} onClick={() => onReloadPrices(shortPeriod)}>
        <span className="gain-info">{'Current value:'}</span>
        <span className="value">{formatCurrency(cachedValue.get('value'))}</span>
        <span className="gain-pct">{formatPercent(gain, { brackets: true, precision: 2 })}</span>
        <span className="cache-age">({cachedValue.get('ageText')})</span>
    </span>;
}

ListHeadExtraFundsComponent.propTypes = {
    totalCost: PropTypes.number.isRequired,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: PropTypes.instanceOf(map).isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

export const ListHeadExtraFunds = connect(
    state => ({
        totalCost: state.getIn(['pages', 'funds', 'data', 'total']),
        shortPeriod: state.getIn(['other', 'graphFunds', 'period']),
        cachedValue: state.getIn(['other', 'fundsCachedValue'])
    }),
    dispatch => ({
        onReloadPrices: shortPeriod => dispatch(aFundsGraphPeriodChanged({
            shortPeriod, noCache: true, reloadPagePrices: true
        }))
    })
)(ListHeadExtraFundsComponent);

export default function ListHeadExtra({ page, ...props }) {
    if (page === 'funds') {
        return <ListHeadExtraFunds {...props} />;
    }

    return null;
}

ListHeadExtra.propTypes = {
    page: PropTypes.string.isRequired
};
