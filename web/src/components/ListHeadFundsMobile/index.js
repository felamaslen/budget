import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import GraphFunds from '~client/containers/GraphFunds';

export default function ListHeadFundsMobile({ totalCost, cachedValue: { value, ageText }, onReloadPrices }) {
    const gain = totalCost
        ? (value - totalCost) / totalCost
        : 0;

    return (
        <div className="funds-info-inner">
            <div className={classNames('gain', {
                profit: gain > 0,
                loss: gain < 0
            })} onClick={onReloadPrices}>
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
    cachedValue: cachedValueShape.isRequired,
    onReloadPrices: PropTypes.func.isRequired
};
