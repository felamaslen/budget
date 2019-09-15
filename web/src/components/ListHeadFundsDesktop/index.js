import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { cachedValueShape } from '~client/prop-types/page/funds';
import { formatCurrency, formatPercent } from '~client/modules/format';

const formatOptions = { brackets: true, precision: 2 };

export default function ListHeadFundsDesktop({
    totalCost,
    viewSoldFunds,
    cachedValue: { value, ageText },
    onReloadPrices,
    onViewSoldToggle,
}) {
    const gainAbsValue = value - totalCost;

    return (
        <>
            <span className={classNames('overall-gain', {
                profit: gainAbsValue > 0,
                loss: gainAbsValue < 0,
            })} onClick={onReloadPrices}>
                <span className="value">{formatCurrency(value)}</span>
                {totalCost && (
                    <span className="gain-values">
                        <span className="gain-pct">{formatPercent(gainAbsValue / totalCost, formatOptions)}</span>
                        <span className="gain-abs">{formatCurrency(gainAbsValue, formatOptions)}</span>
                    </span>
                )}
                <span className="cache-age">({ageText})</span>
            </span>
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
    period: PropTypes.string.isRequired,
    cachedValue: cachedValueShape.isRequired,
    onViewSoldToggle: PropTypes.func.isRequired,
    onReloadPrices: PropTypes.func.isRequired,
};
