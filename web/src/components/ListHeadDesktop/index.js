import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../helpers/format';
import { PAGES } from '../../constants/data';

export default function ListHeadDesktop({ page, weeklyValue, daily, totalCost, AfterHead }) {
    const weeklyValueFormatted = formatCurrency(weeklyValue, {
        abbreviate: true,
        precision: 1
    });

    const dailyValues = daily
        ? <span>
            <span className="daily">{'Daily'}</span>
            <span className="weekly">{'Weekly:'}</span>
            <span className="weekly-value">{weeklyValueFormatted}</span>
        </span>
        : null;

    const totalValue = formatCurrency(totalCost, {
        abbreviate: true,
        precision: 1
    });

    const listHead = PAGES[page].cols.map((column, key) => {
        return <span key={key} className={column}>{column}</span>;
    });

    let afterHead = null;
    if (AfterHead) {
        afterHead = <AfterHead page={page} />;
    }

    return (
        <div className="list-head-inner noselect">
            {listHead}
            {dailyValues}
            <span className="total">{'Total:'}</span>
            <span className="total-value">{totalValue}</span>
            {afterHead}
        </div>
    );
}

ListHeadDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    weeklyValue: PropTypes.number,
    daily: PropTypes.bool,
    totalCost: PropTypes.number,
    AfterHead: PropTypes.func
};

