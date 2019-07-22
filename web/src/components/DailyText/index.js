import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';

const DailyText = ({ value }) => (
    <span className="daily">
        {!(value === null || typeof value === 'undefined') && formatCurrency(value)}
    </span>
);

DailyText.propTypes = {
    value: PropTypes.number
};

export default DailyText;
