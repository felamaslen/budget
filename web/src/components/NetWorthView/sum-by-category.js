import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatCurrency } from '~client/modules/format';
import { sumByCategory } from '~client/components/NetWorthView/calc';
import { dataPropTypes } from '~client/components/NetWorthView/prop-types';

const CATEGORY_CASH_EASY_ACCESS = 'Cash (easy access)';
const CATEGORY_CASH_OTHER = 'Cash (other)';
const CATEGORY_STOCKS = 'Stocks';
const CATEGORY_PENSION = 'Pension';

const SumByCategory = ({ categoryName, className, ...props }) => (
    <th className={classNames('sum-value', className)}>
        {formatCurrency(sumByCategory(categoryName, props), {
            precision: 0
        })}
    </th>
);

SumByCategory.propTypes = {
    categoryName: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired
};

export const SumCashEasyAccess = props => (
    <SumByCategory {...props}
        categoryName={CATEGORY_CASH_EASY_ACCESS}
        className="cash-easy-access"
    />
);

SumCashEasyAccess.propTypes = { ...dataPropTypes };

export const SumCashOther = props => (
    <SumByCategory {...props}
        categoryName={CATEGORY_CASH_OTHER}
        className="cash-other"
    />
);

SumCashOther.propTypes = { ...dataPropTypes };

export const SumStocks = props => (
    <SumByCategory {...props}
        categoryName={CATEGORY_STOCKS}
        className="stocks"
    />
);

SumStocks.propTypes = { ...dataPropTypes };

export const SumPension = props => (
    <SumByCategory {...props}
        categoryName={CATEGORY_PENSION}
        className="pension"
    />
);

SumPension.propTypes = { ...dataPropTypes };
