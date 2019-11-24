import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { Column } from '~client/components/ListRowDesktop/styles';

const DailyText = ({ value }) => (
    <Column column="daily">
        {!(value === null || typeof value === 'undefined') && formatCurrency(value)}
    </Column>
);

DailyText.propTypes = {
    value: PropTypes.number,
};

export default DailyText;
