import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatCurrency } from '~client/modules/format';

const SumByCategory = ({ className, aggregate }) => (
    <th className={classNames('sum-value', className)}>
        {formatCurrency(aggregate[className], { precision: 0 })}
    </th>
);

SumByCategory.propTypes = {
    className: PropTypes.string.isRequired,
    aggregate: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
};

export default SumByCategory;
