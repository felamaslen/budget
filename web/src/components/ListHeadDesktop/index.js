import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { PAGES } from '~client/constants/data';

import * as Styled from './styles';

export default function ListHeadDesktop({
    page,
    weeklyValue,
    getDaily,
    totalCost,
    TotalValue,
    ...extraProps
}) {
    const weeklyValueFormatted = formatCurrency(weeklyValue, {
        abbreviate: true,
        precision: 1,
    });

    return (
        <Styled.ListHead className="list-head">
            {PAGES[page].cols.map((column, key) => (
                <span key={key} className={column}>
                    {column}
                </span>
            ))}
            {getDaily && (
                <span className="daily">
                    <span className="daily-value">{'Daily |'}</span>
                    <span className="weekly">{'Weekly:'}</span>
                    <span className="weekly-value">{weeklyValueFormatted}</span>
                </span>
            )}
            {TotalValue ? (
                <TotalValue totalCost={totalCost} {...extraProps} />
            ) : (
                <div className="total-outer">
                    <span className="total">{'Total:'}</span>
                    <span className="total-value">
                        {formatCurrency(totalCost, {
                            abbreviate: true,
                            precision: 1,
                        })}
                    </span>
                </div>
            )}
        </Styled.ListHead>
    );
}

ListHeadDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    weeklyValue: PropTypes.number,
    getDaily: PropTypes.bool,
    totalCost: PropTypes.number,
    TotalValue: PropTypes.func,
};
