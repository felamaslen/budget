import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import nav1x from '~client/images/nav.png';
import nav2x from '~client/images/nav@2x.png';
import { breakpoint, unimportant } from '~client/styled/mixins';
import { ButtonUnStyled } from '~client/styled/shared/reset';
import { breakpoints, colors } from '~client/styled/variables';
import type { OverviewHeader } from '~client/types';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

const colSizeSmall = [
  PageNonStandard.Funds,
  PageListStandard.Bills,
  PageListStandard.Food,
  PageListStandard.General,
  PageListStandard.Holiday,
  PageListStandard.Social,
  PageListStandard.Income,
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

export const Row = styled.div<{ past?: boolean; active?: boolean; future?: boolean }>(
  ({ past, active, future }) => css`
    display: flex;
    flex-flow: row nowrap;
    width: 100%;

    ${!!active &&
    css`
      font-weight: bold;
    `}

    ${!!past && unimportant}

  ${breakpoint(breakpoints.mobile)} {
      font-size: ${rem(16)};

      ${!!active && 'font-weight: bold;'};
      ${!!(active || future) && `font-size: ${rem(14)};`}
    }

    ${breakpoint(breakpoints.tablet)} {
      ${!!(active || future) && `font-size: ${rem(16)};`}
    }
  `,
);

export type PropsCell = {
  cellColor?: string | null;
  column: 'month' | OverviewHeader;
  past?: boolean;
  active?: boolean;
  future?: boolean;
};

function cellWidthDesktop(column: PropsCell['column']): number {
  if (colSizeSmall.includes(column)) {
    return 7;
  }
  if (column === 'netWorth') {
    return 12;
  }
  return 10;
}

export const Cell = styled.div<PropsCell>(
  ({ active, column, future, past }) => css`
    display: flex;
    flex-flow: row nowrap;
    flex-grow: 1;
    flex-basis: 0;
    padding: ${rem(4)};
    position: relative;
    width: 100%;
    vertical-align: middle;
    text-align: left;
    height: ${rem(32)};
    line-height: ${rem(24)};

    ${!!active && `font-weight: bold;`}

    ${!!past && column === 'month' && `background: ${colors.light.mediumLight};`}

  ${!!active &&
    column === 'month' &&
    css`
      background: ${colors.green};
      color: ${colors.white};
    `}

  ${!!future && column === 'month' && `background: ${colors.amber}`}

  ${breakpoint(breakpoints.mobileSmall)} {
      padding: ${rem(4)};
      white-space: nowrap;
    }

    ${breakpoint(breakpoints.mobile)} {
      display: flex;
      padding: 0 ${rem(2)};
      flex-grow: ${cellWidthDesktop(column)};
      height: ${rem(24)};

      ${!!past &&
      css`
        height: ${rem(16)};
        line-height: ${rem(18)};
        font-size: ${rem(13)};
      `}

      ${!!(active || future) && `line-height: ${rem(26)};`}

    ${([PageListStandard.Income, PageNonStandard.Funds] as (OverviewHeader | 'month')[]).includes(
        column,
      ) && `border-left: 3px solid ${colors.dark.mediumLight};`};

      ${column === 'net' && `border-right: 3px solid ${colors.light.mediumLight};`};
    }
  `,
);

export const Header = styled(Row)`
  flex: 0 0 auto;
  font-weight: bold;
`;

export const HeaderLink = styled(Cell)`
  align-items: center;
  display: inline-flex;
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
  height: ${rem(24)};
  text-align: center;
  background: ${({ column }): string =>
    colors.overview[`${column}Mobile` as keyof typeof colors.overview] ?? colors.white};

  button {
    flex: 0 0 auto;
  }

  ${breakpoint(breakpoints.mobile)} {
    padding: ${rem(2)};
  }
`;

export const HeaderLinkButton = styled(ButtonUnStyled)`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  height: ${rem(22)};
  justify-content: center;
  margin: 0;
  padding: 0;
  width: ${rem(22)};

  ${breakpoint(breakpoints.mobile)} {
    margin: 0 ${rem(2)};
  }
`;

export const AddReceiptButton = styled.span`
  background-image: url(${nav1x});
  background-position: -92px -62px;
  display: block;
  height: ${rem(22)};
  width: ${rem(22)};

  @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    background-image: url(${nav2x});
    background-size: 262px 88px;
  }
`;

export const BucketButton = styled.span`
  background-image: url(${nav1x});
  background-position: -120px -62px;
  display: block;
  height: ${rem(22)};
  width: ${rem(22)};

  @media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    background-image: url(${nav2x});
    background-size: 262px 88px;
  }
`;

export const HeaderText = styled.span`
  color: black;
  flex: 1;

  ${breakpoint(breakpoints.mobile)} {
    padding: 0 ${rem(2)};
    text-align: left;
  }
`;
