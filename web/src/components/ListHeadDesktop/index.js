import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { PAGES } from '~client/constants/data';

import * as Styled from './styles';
import { Column } from '~client/components/ListRowDesktop/styles';

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
                <Column key={key} column={column} className={column}>
                    {column}
                </Column>
            ))}
            {getDaily && (
                <Styled.Daily className="daily">
                    <Styled.DailyValue className="daily-value">{'Daily |'}</Styled.DailyValue>
                    <Styled.Weekly className="weekly">{'Weekly:'}</Styled.Weekly>
                    <Styled.WeeklyValue className="weekly-value">
                        {weeklyValueFormatted}
                    </Styled.WeeklyValue>
                </Styled.Daily>
            )}
            {TotalValue ? (
                <TotalValue totalCost={totalCost} {...extraProps} />
            ) : (
                <Styled.TotalOuter className="total-outer">
                    <Styled.Total className="total">{'Total:'}</Styled.Total>
                    <Styled.TotalValue className="total-value">
                        {formatCurrency(totalCost, {
                            abbreviate: true,
                            precision: 1,
                        })}
                    </Styled.TotalValue>
                </Styled.TotalOuter>
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
