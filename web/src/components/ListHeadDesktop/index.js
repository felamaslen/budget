import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { PAGES } from '~client/constants/data';

export default function ListHeadDesktop({
    page,
    weeklyValue,
    getDaily,
    totalCost,
    TotalValue
}) {
    const weeklyValueFormatted = formatCurrency(weeklyValue, {
        abbreviate: true,
        precision: 1
    });

    return (
        <div className="list-head-inner noselect">
            {PAGES[page].cols.map((column, key) => (
                <span key={key} className={column}>{column}</span>
            ))}
            {getDaily && (
                <span>
                    <span className="daily">{'Daily |'}</span>
                    <span className="weekly">{'Weekly:'}</span>
                    <span className="weekly-value">{weeklyValueFormatted}</span>
                </span>
            )}
            {TotalValue && <TotalValue /> || (
                <div className="total-outer">
                    <span className="total">{'Total:'}</span>
                    <span className="total-value">{formatCurrency(totalCost, {
                        abbreviate: true,
                        precision: 1
                    })}</span>
                </div>
            )}
        </div>
    );
}

ListHeadDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    weeklyValue: PropTypes.number,
    getDaily: PropTypes.bool,
    totalCost: PropTypes.number,
    TotalValue: PropTypes.func
};
