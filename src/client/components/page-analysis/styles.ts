import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { breakpoint } from '~client/styled/mixins';
import { Button as ButtonBase, Page as PageBase, H3 } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';
import type { Page as PageType, MainBlockName } from '~client/types';

export const blocksHeightMobile = 360;

export const Input = styled.span`
  display: block;
  margin: 0.3em 0;
  text-align: center;
  text-transform: capitalize;

  ${breakpoint(breakpoints.mobile)} {
    margin: 0 0 0 0.5em;
    padding: 0.5em 0.5em 0.5em 0;
    border-right: 2px solid ${colors.medium.light};
  }

  ${breakpoint(breakpoints.tablet)} {
    display: inline;
    margin: 0 1em;
    padding: 0;
    border-right: none;
  }
`;

export const Button = styled(ButtonBase)`
  margin: 0 0.3em;
  flex-basis: 0;
  flex-grow: 1;
  font-size: 0.75em;
`;

export const Buttons = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  margin: 0.3em 0;

  ${breakpoint(breakpoints.mobile)} {
    margin-left: 0.5em;
    width: auto;
  }

  ${breakpoint(breakpoints.tablet)} {
    float: right;
  }
`;

export const PeriodTitle = styled(H3)`
  width: 100%;
  margin: 0;
  text-align: center;

  ${breakpoint(breakpoints.mobile)} {
    width: 100%;
  }

  ${breakpoint(breakpoints.tablet)} {
    margin: 5px 10px;
    font-size: 1.2em;
    text-align: left;
  }
`;

export const Upper = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;

  ${breakpoint(breakpoints.mobile)} {
    flex-flow: row wrap;
  }

  ${breakpoint(breakpoints.tablet)} {
    display: block;
    margin: 4px 0;
    padding-right: ${rem(50)};
  }
`;

const indicatorColors: Record<MainBlockName, string> = {
  income: colors.income.main,
  bills: colors.bills.main,
  general: colors.general.main,
  food: colors.food.main,
  holiday: colors.holiday.main,
  social: colors.social.main,
  saved: colors.blockColor.saved,
  invested: colors.overview.balanceStocks,
};

export type TreeProps = { open?: boolean; bold?: boolean; hasSubTree?: boolean; indent?: number };

export const TreeMain = styled.div<Pick<TreeProps, 'open' | 'hasSubTree'>>(
  ({ open, hasSubTree = true }) =>
    hasSubTree
      ? css`
          &::before {
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: ${rem(5)} 0 ${rem(5)} ${rem(9)};
            border-color: transparent;
            border-left-color: black;

            ${!!open &&
            css`
              border-left-color: transparent;
              border-top-color: black;
              border-width: 8.7px 5px 0 5px;
            `}
          }
        `
      : css``,
);

export const TreeIndicator = styled.span<{ name?: MainBlockName }>`
  display: flex;
  flex-basis: ${rem(16)} !important;
  width: ${rem(16)};
  height: ${rem(16)};
  margin-left: ${rem(14)};
  background: ${({ name }): string => (name ? indicatorColors[name] : 'white')};
`;

export const TreeToggle = styled.span`
  flex-basis: ${rem(16)};
`;

export const TreeTitle = styled.span`
  flex-grow: 2;
  text-transform: capitalize;
`;

export const TreeTitleFilled = styled(TreeTitle)`
  padding-left: ${rem(14 + 16 + 20)};
`;

export const TreeValue = styled.span`
  flex-grow: 1;
  justify-content: flex-end;
`;

export const TreeListItemInner = styled.div``;

export const TreeListItem = styled.li<TreeProps>(
  ({ bold, indent = 0 }) => css`
    display: flex;
    flex-flow: column;
    font-size: ${rem(16 - indent * 2)};
    font-weight: ${bold ? 'bold' : 'normal'};
    line-height: ${rem(24)};
    white-space: nowrap;
    cursor: pointer;
    span {
      display: flex;
      flex-basis: 0;
    }

    ${TreeTitle}, ${TreeTitleFilled} {
      margin-left: ${rem(indent * 8)};
    }
  `,
);

export const TreeListSelected = styled.div`
  &:before {
    content: '(';
  }
  &:after {
    content: ')';
  }
`;

export const TreeListHeadItem = styled(TreeListItem)`
  font-weight: bold;

  ${TreeListItemInner} {
    display: flex;
    flex-flow: row nowrap;
  }
  ${TreeValue} {
    display: flex;
    flex-flow: column;
    text-align: right;
  }
`;

export const SubTree = styled.ul`
  margin: 0 0.5em 0 3em;
  padding: 0;
  list-style: none;
  background: ${colors.highlight.light};
  ${TreeMain} {
    display: flex;
    font-size: 0.9em;
  }

  ${TreeListItem} {
    ${TreeTitle} {
      margin-right: 4px;
      overflow: hidden;
    }
  }
`;

export const Tree = styled.div`
  flex: 0 0 ${rem(200)};
  overflow-y: auto;
  padding: ${rem(4)};

  ${breakpoint(breakpoints.mobile)} {
    flex: 1 1 0;
  }
`;

export const TreeList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  & > ${TreeListItem} {
    position: relative;
    &:nth-of-type(2n + 1) > ${TreeMain} {
      background: ${colors.light.mediumLight};
    }
    & > ${TreeMain} {
      display: flex;
      flex-flow: row;
      align-items: center;
      &:before {
        content: '';
      }
    }
  }

  ${breakpoint(breakpoints.mobile)} {
    & > ${TreeListItem} > ${TreeMain}, ${SubTree} ${TreeListItem} {
      &:hover {
        background: ${colors.blue};
      }
    }
  }
`;

export const Outer = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-flow: column-reverse;

  ${breakpoint(breakpoints.tablet)} {
    display: grid;
    grid-template-rows: ${rem(500)} auto;
    grid-template-columns: auto ${rem(500)};
    flex: 1 1 0;
    min-height: 0;
  }
`;

export const DataItem = styled.span`
  display: block;
  flex-grow: 1;
  height: 100%;
`;

export const Page = styled(PageBase)<{ page: PageType }>`
  flex: 1 1 0;
  overflow-y: auto;

  ${breakpoint(breakpoints.mobile)} {
    flex-flow: column;
  }

  ${breakpoint(breakpoints.tablet)} {
    min-height: 0;
    flex-flow: column;

    ${Tree} {
      display: flex;
      grid-row: 1 / span 2;
      grid-column: 1;
      flex-flow: column;
      padding: 0;
      min-height: 0;
      min-width: 400px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    ${TreeList} {
      display: flex;
      flex-flow: column;
      min-height: 0;
      flex: 1 1 auto;
      margin: 1em;
    }
  }
`;
