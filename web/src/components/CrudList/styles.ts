import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { CategoryList as NetWorthCategoryList } from '~client/components/NetWorthCategoryList/styles';
import { NetWorthList } from '~client/components/NetWorthList/styles';
import { SubcategoryList as NetWorthSubcategoryList } from '~client/components/NetWorthSubcategoryList/styles';
import { colors } from '~client/styled/variables';

export const CrudList = styled.div<{ active: boolean }>`
  ${NetWorthList} & {
    display: flex;
    width: ${({ active }): number => (active ? 700 : 500)}px;
    flex: 0 0 480px;
    flex-flow: column;

    ${({ active }): false | FlattenSimpleInterpolation =>
      active &&
      css`
        flex: 1;
        flex-flow: column;
        min-height: 0;
      `}
  }

  ${NetWorthCategoryList} & {
    display: flex;
    flex-flow: column;
    min-height: 0;
  }

  ${NetWorthSubcategoryList} & {
    display: grid;
    grid-template-columns: inherit;
    grid-row: 2;
    grid-column: 1 / span 5;
  }
`;

export const CrudListInner = styled.div<{ active: boolean }>`
  ${NetWorthList} & {
    display: flex;
    flex: 1 1 0;
    width: 100%;

    ${({ active }): FlattenSimpleInterpolation =>
      active
        ? css`
            flex: 1 1 0;
            flex-flow: column;
            min-height: 0;
          `
        : css`
            display: grid;
            grid-template-rows: 448px 32px;
          `}
  }
  ${NetWorthCategoryList} & {
    display: flex;
    min-height: 0;
    flex-flow: column-reverse;
    overflow-y: auto;
  }
  ${NetWorthSubcategoryList} & {
    display: flex;
    flex-flow: column-reverse;
    grid-column: 1 / span 5;
  }
`;

export const CrudWindow = styled.div<{ active: boolean; createActive: boolean }>`
  display: flex;
  margin: 0;
  padding: 0;
  flex-flow: column;
  list-style: none;

  ${NetWorthList} & {
    ${({ active }): FlattenSimpleInterpolation =>
      active
        ? css`
            flex: 1 1 0;
            min-height: 0;
            width: 100%;
            position: relative;
            background: ${colors.white};
          `
        : css`
            display: grid;
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
              border: 2px dashed ${colors.light};
              color: ${colors.light};
              border-radius: 5px;
            }
          `}

    ${({ createActive }): false | FlattenSimpleInterpolation =>
      createActive &&
      css`
        display: none;
      `};
  }
`;
