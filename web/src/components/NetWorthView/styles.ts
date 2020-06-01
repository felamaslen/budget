import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { colors } from '~client/styled/variables';
import { Aggregate } from '~client/types/net-worth';

export const NetWorthView = styled.div`
  display: flex;
  margin: 0 3px;
  min-height: 0;
  max-height: 720px;
  overflow: hidden;
  background: ${colors['translucent-l95']};
`;

export const Table = styled.table`
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 12px;
  line-height: 20px;
  thead {
    border-right: 1px solid ${colors['slightly-light']};
    border-left: 1px solid ${colors['slightly-light']};

    tr {
      border-bottom: none;
    }
  }
  tr {
    border-bottom: 1px solid ${colors['slightly-light']};
  }
  td {
    border-right: 1px solid ${colors['slightly-light']};
  }
`;

export const Graphs = styled.div``;

export const Row = styled.tr``;

export const RowCategories = styled(Row)``;

export const RowSubtitle = styled(Row)``;

export const Column = styled.td<{ item: string }>`
  ${({ item }): false | FlattenSimpleInterpolation =>
    item === 'date-short' &&
    css`
      font-style: italic;
    `};
  ${({ item }): false | FlattenSimpleInterpolation =>
    item !== 'date-short' &&
    css`
      text-align: right;
      padding: 0 4px 0 10px;
      font-weight: bold;
    `};
`;

export const DateQuarter = styled.span`
  font-weight: bold;
`;

export const Header = styled.th<{ item: string }>`
  background: ${({ item }): string => colors.netWorth[item]};
`;

export const HeaderRetirement = styled(Header)`
  width: 180px;
`;

export const Sum = styled.th``;

export const SumValue = styled(Sum)<{ item: Aggregate }>`
  padding: 0 5px;
  background: ${({ item }): string => colors.netWorth.aggregate[item]};
`;