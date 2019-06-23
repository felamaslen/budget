import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';

export default function DailyText({ value }) {
    if (value === null) {
        return null;
    }
    if (typeof value === 'undefined') {
        return (<span className="daily" />);
    }

    return (
        <span className="daily">
            {formatCurrency(value)}
        </span>
    );
}

DailyText.propTypes = {
    value: PropTypes.number
};
