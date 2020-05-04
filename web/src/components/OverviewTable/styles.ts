import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { rgb } from 'polished';
import isSameDay from 'date-fns/isSameDay';
import endOfMonth from 'date-fns/endOfMonth';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint, unimportant } from '~client/styled/mixins';
import { Color } from '~client/constants/colors';

const columnsDesktop = [
  'month',
  'funds',
  'bills',
  'food',
  'general',
  'holiday',
  'social',
  'income',
  'spending',
  'net',
  'netWorthPredicted',
  'netWorth',
];

const hideColumns = ['funds', 'bills', 'food', 'general', 'holiday', 'social'];

const colSizeSmall = [...hideColumns, 'income', 'spending'];

const hideOverviewColumns = (maxWidth: number) => ({
  column,
}: {
  column: string;
}): FlattenSimpleInterpolation => css`
  @media only screen and (max-width: ${maxWidth}px) {
    display: ${hideColumns.includes(column) ? 'none' : 'inline-block'};
    ${column === 'income' &&
      css`
        border-left: none;
      `}
  }
`;

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

const isEndOfMonth = isSameDay(new Date(), endOfMonth(new Date()));

const displayMobile = (column: string, past: boolean, active: boolean): boolean =>
  ['month', 'income', 'spending'].includes(column) ||
  (past && column === 'netWorth') ||
  (active && isEndOfMonth && column === 'netWorth') ||
  (active && !isEndOfMonth && column === 'netWorthPredicted') ||
  (!past && !active && column === 'netWorthPredicted');

export const Cell = styled.div.attrs(({ cellColor: color }: { cellColor?: Color }) => ({
  style: color ? { backgroundColor: rgb(color[0], color[1], color[2]) } : {},
}))<{
  cellColor?: Color | null;
  column: string;
  past?: boolean;
  active?: boolean;
  future?: boolean;
}>`
    flex-flow: row nowrap;
    flex-grow: 1;
    flex-basis: 0;
    display: ${({ column, past, active }): 'flex' | 'none' =>
      displayMobile(column, !!past, !!active) ? 'flex' : 'none'};
    padding: 4px 2px;
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
        background: ${colors.light};
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
        padding: 4px 10px;
        white-space: nowrap;
    }

    ${breakpoint(breakpoints.mobile)} {
      display: ${({ column }): 'flex' | 'none' => {
        if (columnsDesktop.includes(column)) {
          return 'flex';
        }

        return 'none';
      }};
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
      ${hideOverviewColumns(880)};

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
        column === 'month' &&
        css`
          border-right: 3px solid ${colors.dark};
        `}
      ${({ column }): false | FlattenSimpleInterpolation =>
        column === 'income' &&
        css`
          border-left: 3px solid ${colors.dark};
        `}
      ${({ column }): false | FlattenSimpleInterpolation =>
        column === 'net' &&
        css`
          border-right: 3px solid ${colors.light};
        `}
      ${({ column }): false | FlattenSimpleInterpolation =>
        column === 'netWorthPredicted' &&
        css`
          font-style: italic;
        `}
    }

    ${breakpoint(breakpoints.tablet)} {
        ${hideOverviewColumns(1380)};
    }
`;

export const Header = styled(Row)`
  flex: 0 0 auto;
  font-weight: bold;
`;

export const HeaderLink = styled(Cell)`
  padding: 2px 0;
  overflow: hidden;
  white-space: nowrap;
  height: 24px;
  text-align: center;
  background: ${({ column }): string => colors.overview[`${column}Mobile`] || colors.white};

  ${({ column }): false | FlattenSimpleInterpolation =>
    column === 'netWorth' &&
    css`
      display: none;
    `}}

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
