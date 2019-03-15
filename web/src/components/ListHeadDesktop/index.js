import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/helpers/format';
import { PAGES } from '~client/constants/data';

export default function ListHeadDesktop({ TotalValue, ...props }) {
    const { page, weeklyValue, getDaily, totalCost } = props;

    let totalValue = null;
    if (TotalValue) {
        totalValue = (
            <TotalValue {...props} />
        );
    }
    else {
        const value = formatCurrency(totalCost, {
            abbreviate: true,
            precision: 1
        });

        totalValue = (
            <div className="total-outer">
                <span className="total">{'Total:'}</span>
                <span className="total-value">{value}</span>
            </div>
        );
    }

    const weeklyValueFormatted = formatCurrency(weeklyValue, {
        abbreviate: true,
        precision: 1
    });

    const dailyValues = getDaily
        ? <span>
            <span className="daily">{'Daily |'}</span>
            <span className="weekly">{'Weekly:'}</span>
            <span className="weekly-value">{weeklyValueFormatted}</span>
        </span>
        : null;

    const listHead = PAGES[page].cols.map((column, key) => {
        return <span key={key} className={column}>{column}</span>;
    });

    return (
        <div className="list-head-inner noselect">
            {listHead}
            {dailyValues}
            {totalValue}
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

