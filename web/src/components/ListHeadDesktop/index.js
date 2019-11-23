import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { PageContext, ListContext } from '~client/context';
import { PAGES } from '~client/constants/data';
import * as Styled from './styles';
import { Column } from '~client/components/ListRowDesktop/styles';

export default function ListHeadDesktop() {
    const page = useContext(PageContext);
    const { weeklyValue, getDaily, totalCost, TotalValue, ...rest } = useContext(ListContext);
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
                <TotalValue totalCost={totalCost} />
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
    TotalValue: PropTypes.func,
};
