import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';
import type { Aggregate, NetWorthTableColumn } from '~client/types';

export const NetWorthView = styled.div`
  background: ${colors.translucent.light.light};
  display: flex;
  flex: 1 1 0;
  flex-flow: column;
  margin: 0 3px;
  min-height: 0;
  position: relative;

  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
    flex-flow: row;
    min-height: 0;
    max-height: ${rem(720)};
  }
`;

export const Table = styled.div`
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;

  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
    height: auto;
    min-height: initial;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    font-size: 12px;
    line-height: 20px;
    width: 100%;
  }

  thead {
    border-right: 1px solid ${colors.light.mediumDark};
    border-left: 1px solid ${colors.light.mediumDark};

    tr {
      border-bottom: none;
    }
  }

  tr {
    border-bottom: 1px solid ${colors.light.mediumDark};
  }
  td {
    border-right: 1px solid ${colors.light.mediumDark};
  }
`;

export const Graphs = styled.div`
  display: flex;
  box-shadow: 0 0 6px ${colors.shadow.mediumLight};
  flex: 0 0 auto;
  flex-flow: row;

  ${breakpoint(breakpoints.mobile)} {
    flex-flow: column;
    box-shadow: none;
  }
`;

export const Row = styled.tr``;

export const RowCategories = styled(Row)``;

export const RowSubtitle = styled(Row)``;

export const Column = styled.td<{ item: string }>(
  ({ item }) => css`
    ${item === 'date-short' &&
    css`
      font-style: italic;
    `};
    ${item !== 'date-short' &&
    css`
      text-align: right;
      padding: 0 4px 0 10px;
      font-weight: bold;
    `};
  `,
);

export const DateQuarter = styled.span`
  font-weight: bold;
`;

export const Header = styled.th<{ item: NetWorthTableColumn }>`
  background: ${({ item }): string => colors.netWorth[item]};
`;

export const HeaderRetirement = styled(Header)`
  font-size: ${rem(10)};
  white-space: nowrap;

  ${breakpoint(breakpoints.mobile)} {
    font-size: ${rem(12)};
    width: ${rem(180)};
  }
`;

export const Sum = styled.th``;

export const SumValue = styled(Sum)<{ item: Aggregate }>`
  padding: 0 5px;
  background: ${({ item }): string => colors.netWorth.aggregate[item]};
`;
