import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { CategoryList as NetWorthCategoryList } from '~client/components/net-worth/category-list/styles';
import { NetWorthList } from '~client/components/net-worth/list/styles';
import { SubcategoryList as NetWorthSubcategoryList } from '~client/components/net-worth/subcategory-list/styles';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const CrudList = styled.div<{ active: boolean }>(
  ({ active }) => css`
    ${NetWorthList} & {
      display: flex;
      flex-flow: column;
      min-height: 0;

      ${active &&
      css`
        flex: 1;
        min-height: initial;
      `};

      ${breakpoint(breakpoints.mobile)} {
        width: ${rem(active ? 700 : 500)};
        flex: 0 0 ${rem(480)};
        min-height: initial;

        ${active &&
        css`
          flex: 1;
          flex-flow: column;
          min-height: 0;
        `}
      }
    }

    ${NetWorthCategoryList} & {
      display: flex;
      flex-flow: column;
      min-height: 0;
    }

    ${NetWorthSubcategoryList} & {
      ${breakpoint(breakpoints.mobile)} {
        display: grid;
        grid-template-columns: inherit;
        grid-row: 2;
        grid-column: 1 / span 5;
      }
    }
  `,
);

export const CrudListInner = styled.div<{ active: boolean }>(
  ({ active }) => css`
    ${NetWorthList} & {
      display: flex;
      flex-flow: column;
      flex: 1;
      min-height: 0;

      ${breakpoint(breakpoints.mobile)} {
        flex: 1 1 0;
        width: 100%;

        ${active
          ? css`
              flex: 1 1 0;
              flex-flow: column;
              min-height: 0;
            `
          : css`
              display: grid;
              grid-template-rows: ${rem(448)} ${rem(32)};
            `}
      }
    }
    ${NetWorthCategoryList} & {
      display: flex;
      flex-flow: column;
      min-height: 0;
      overflow-y: auto;
    }
    ${NetWorthSubcategoryList} & {
      display: flex;
      flex-flow: column;
      grid-column: 1 / span 5;
    }
  `,
);

export const CrudWindow = styled.div<{ active: boolean; createActive: boolean }>(
  ({ active, createActive }) => css`
    display: flex;
    margin: 0;
    padding: 0;
    flex-flow: column;
    list-style: none;

    ${NetWorthList} & {
      flex: 1;
      min-height: 0;
      overflow: auto;

      ${breakpoint(breakpoints.mobile)} {
        ${active
          ? css`
              flex: 1 1 0;
              width: 100%;
              position: relative;
              background: ${colors.white};
            `
          : css`
              display: grid;
              min-height: initial;
              padding: 6px;
              grid-row: 1;
              grid-column: 1;
              grid-gap: 6px;
              grid-template-rows: repeat(6, 1fr);
              grid-template-columns: repeat(5, 1fr);
              &::after {
                display: flex;
                content: 'Latest';
                align-items: center;
                justify-content: center;
                grid-row: 6;
                grid-column: 3;
                z-index: 2;
                font-weight: bold;
                text-transform: uppercase;
                border: 2px dashed ${colors.light.mediumLight};
                color: ${colors.light.mediumLight};
                border-radius: 5px;
              }
            `}
      }

      ${createActive && `display: none;`};
    }
  `,
);
