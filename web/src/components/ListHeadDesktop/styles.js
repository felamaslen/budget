import styled from 'styled-components';
import { colors } from '~client/styled/variables';
import { RowBase } from '~client/components/ListRowDesktop/styles';

export const ListHead = styled(RowBase)`
    display: flex;
    flex: 0 0 24px;
    align-items: center;
    flex-flow: row nowrap;
    font-weight: bold;
    line-height: 24px;
    text-transform: capitalize;
    white-space: nowrap;
    text-align: left;
    line-height: 24px;
    border-bottom: 1px solid ${colors['medium-very-light']};
    user-select: none;
`;

const ExtraItem = styled.span`
    padding-left: 1px;
`;

const Value = styled.span`
    margin-left: 0.2em;
    padding-left: 0.2em;
`;

export const Daily = styled(ExtraItem)``;
export const DailyValue = styled(ExtraItem)``;
export const Weekly = styled(Value)``;
export const WeeklyValue = styled(Value)``;

export const TotalOuter = styled.div``;
export const Total = styled(Value)``;
export const TotalValue = styled(Value)``;
