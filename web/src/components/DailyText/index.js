import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../helpers/format';

export default function DailyText({ enabled, row }) {
    if (!enabled) {
        return null;
    }

    if (!row.has('daily')) {
        return <span className="daily" />;
    }

    return (
        <span className="daily">
            {formatCurrency(row.get('daily'))}
        </span>
    );
}

DailyText.propTypes = {
    enabled: PropTypes.bool.isRequired,
    row: PropTypes.instanceOf(map).isRequired
};

