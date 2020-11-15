import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { breakpoint, unimportant, rem } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';
import { Page, OverviewHeader } from '~client/types';

const colSizeSmall = [
  Page.funds,
  Page.bills,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
  Page.income,
  'spending',
];

export const OverviewTable = styled.div`
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  overflow-y: auto;
  user-select: none;

  ${breakpoint(breakpoints.mobile)} {
    cursor: default;
    flex: 1 1 0;
    width: 100%;
    overflow-y: unset;
  }

  ${breakpoint(breakpoints.tablet)} {
    flex: 1 0 700px;
    max-width: 1024px;
    overflow-y: unset;
  }
`;

export const Rows = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;

  ${breakpoint(breakpoints.mobile)} {
    overflow-y: unset;
    overflow: hidden;
  }
  ${breakpoint(breakpoints.tablet)} {
    overflow: unset;
  }
`;

export const Row = styled.div<{ past?: boolean; active?: boolean; future?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;

  ${({ active }): false | FlattenSimpleInterpolation =>
    !!active &&
    css`
      font-weight: bold;
    `}

  ${({ past }): false | FlattenSimpleInterpolation => !!past && unimportant}

  ${breakpoint(breakpoints.mobile)} {
    font-size: 16px;

    ${({ active }): false | FlattenSimpleInterpolation =>
      !!active &&
      css`
        font-weight: bold;
      `}
    ${({ active, future }): false | FlattenSimpleInterpolation =>
      !!(active || future) &&
      css`
        font-size: 14px;
      `}
  }

  ${breakpoint(breakpoints.tablet)} {
    ${({ active, future }): false | FlattenSimpleInterpolation =>
      !!(active || future) &&
      css`
        font-size: 16px;
      `}
  }
`;

export type PropsCell = {
  cellColor?: string | null;
  column: 'month' | OverviewHeader;
  past?: boolean;
  active?: boolean;
  future?: boolean;
};

export const Cell = styled.div.attrs(({ cellColor: backgroundColor }: { cellColor?: string }) => ({
  style: backgroundColor ? { backgroundColor } : {},
}))<PropsCell>`
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 1;
  flex-basis: 0;
  padding: ${rem(4)};
  position: relative;
  width: 100%;
  vertical-align: middle;
  text-align: left;
  height: 32px;
  line-height: 24px;

  ${({ active }): false | FlattenSimpleInterpolation =>
    !!active &&
    css`
      font-weight: bold;
    `}}

  ${({ past, column }): false | FlattenSimpleInterpolation =>
    !!past &&
    column === 'month' &&
    css`
      background: ${colors.light.mediumLight};
    `}

  ${({ active, column }): false | FlattenSimpleInterpolation =>
    !!active &&
    column === 'month' &&
    css`
      background: ${colors.green};
      color: ${colors.white};
    `}

  ${({ future, column }): false | FlattenSimpleInterpolation =>
    !!future &&
    column === 'month' &&
    css`
      background: ${colors.amber};
    `}

  ${breakpoint(breakpoints.mobileSmall)} {
    padding: ${rem(4)};
    white-space: nowrap;
  }

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    padding: 0 2px;
    flex-grow: ${({ column }): number => {
      if (colSizeSmall.includes(column)) {
        return 7;
      }
      if (column === 'netWorthPredicted') {
        return 9;
      }
      if (column === 'netWorth') {
        return 12;
      }

      return 10;
    }};
    height: 24px;

    ${({ past }): false | FlattenSimpleInterpolation =>
      !!past &&
      css`
        height: 16px;
        line-height: 18px;
        font-size: 13px;
      `}

    ${({ active, future }): false | FlattenSimpleInterpolation =>
      !!(active || future) &&
      css`
        line-height: 26px;
      `}

    ${({ column }): false | FlattenSimpleInterpolation =>
      ([Page.income, Page.funds] as (OverviewHeader | 'month')[]).includes(column) &&
      css`
        border-left: 3px solid ${colors.dark.mediumLight};
      `}
    ${({ column }): false | FlattenSimpleInterpolation =>
      column === 'net' &&
      css`
        border-right: 3px solid ${colors.light.mediumLight};
      `}
    ${({ column }): false | FlattenSimpleInterpolation =>
      column === 'netWorthPredicted' &&
      css`
        font-style: italic;
      `}
  }
`;

export const Header = styled(Row)`
  flex: 0 0 auto;
  font-weight: bold;
`;

export const HeaderLink = styled(Cell)`
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
  height: 24px;
  text-align: center;
  background: ${({ column }): string => colors.overview[`${column}Mobile`] || colors.white};

  button {
    flex: 0 0 auto;
  }

  ${breakpoint(breakpoints.mobile)} {
    padding: 2px;
  }
`;

export const HeaderText = styled.span`
  color: black;

  ${breakpoint(breakpoints.mobile)} {
    padding: 0 2px;
  }
`;
