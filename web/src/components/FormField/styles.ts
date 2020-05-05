import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { breakpoints, colors } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';
import { ModalDialog, FormRowInner } from '~client/components/ModalDialog/styles';
import { Editable } from '~client/components/Editable/styles';
import { Row as ListRowDesktop } from '~client/components/ListRowDesktop/styles';
import { RowCreate } from '~client/components/ListCreateDesktop/styles';
import {
  EditByCategory,
  AddByCategoryValue,
  AddCurrency,
  currencyTitleWidth,
} from '~client/components/NetWorthEditForm/styles';
import { CategoryItemForm as NetWorthCategoryItemForm } from '~client/components/NetWorthCategoryList/styles';
import { SubcategoryList as NetWorthSubcategoryList } from '~client/components/NetWorthSubcategoryList/styles';

export const centerGridOne = css`
  display: flex;
  margin: 0 0.2em;
  align-items: center;
  justify-content: center;
  grid-row: 1;
`;

export const FormField = styled.div<{
  name?: string;
  item: string;
  small: boolean;
  active: boolean;
  invalid: boolean;
}>`
    ${breakpoint(breakpoints.mobile)} {
        opacity: ${({ small, active }): number => (small && !active ? 0.3 : 1)};
    }

    ${({ small }): false | FlattenSimpleInterpolation =>
      small &&
      css`
        &,
        input {
          width: 100px;
        }
      `}

    ${({ item }): false | FlattenSimpleInterpolation =>
      item === 'text' &&
      css`
        ${AddCurrency} & {
          margin: 0 5px;
          flex: 0 0 ${currencyTitleWidth}px;
          input {
            margin: 0;
            padding-left: 0;
            padding-right: 0;
            width: ${currencyTitleWidth - 4}px;
          }
        }
      `}

    ${NetWorthCategoryItemForm} & {
        ${({ item }): false | FlattenSimpleInterpolation =>
          ['type', 'category', 'color'].includes(item) && centerGridOne};
        ${({ item }): false | FlattenSimpleInterpolation =>
          item === 'category' &&
          css`
            padding: 0 0.2em;
            border: none;
            outline: none;
            font-size: 18px;

            input {
              width: 100%;
              font-size: 16px;
            }
          `};
    }

    ${NetWorthSubcategoryList} & {
        ${({ item }): null | FlattenSimpleInterpolation => {
          if (item === 'subcategory') {
            return css`
              margin: 0 2em;
              padding: 0 0.5em;
              grid-column: 1;
            `;
          }
          if (item === 'credit-limit') {
            return css`
              margin: auto;
              grid-column: 2;
            `;
          }
          if (item === 'opacity') {
            return css`
              margin: 0 1em;
              grid-column: 3;

              input {
                width: 100%;
              }
            `;
          }

          return null;
        }};
    }

    ${ModalDialog} & {
        display: flex;
        flex-flow: column nowrap;
        flex-basis: 0;
        flex-grow: 2;
        border: 0;
        line-height: 28px;
        &::after {
            display: block;
            content: '';
            width: 100%;
            height: 4px;
        border: 1px solid ${({ invalid }): string =>
          invalid ? (colors.error as string) : (colors['slightly-light'] as string)};
            border-top: none;
        }
        input[type='text'],
        input[type='number'],
        input[type='date'] {
            display: block;
            border: none;
            outline: none;
            line-height: 28px;
            width: 100%;
            font-size: 16px;
        }

    ${({ name }): false | FlattenSimpleInterpolation =>
      name === 'transactions' &&
      css`
        flex-basis: auto;
      `};
        }

    ${FormRowInner} > & {
        &::after {
            display: none;
        }
    }
`;

const transactionsWidthDate = 120;
const transactionsWidthUnits = 60;
const transactionsWidthCost = 60;

export const TransactionsModal = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    padding: 2px 1px 4px 1px;
    position: absolute;
    top: 0;
    z-index: 2;
    background: ${colors['translucent-l8'] as string};
    box-shadow: 0 3px 6px ${colors['shadow-l2'] as string};

    ${Editable} & {
      left: 0;
      width: 300px;
      min-height: 100px;
      z-index: 5;
      line-height: 26px;
      input {
        width: 95%;
      }
      thead {
        font-size: 0.9em;
      }
    }

    ${ListRowDesktop}:nth-last-child (-n + 3) & {
      top: initial;
      bottom: 0;
    }

    ${RowCreate} & {
      top: 0;
      bottom: initial;
    }
  }
`;

export const ModalInner = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    ${Editable} & {
      padding: 0.2em;
    }
  }
`;

export const ModalHead = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    line-height: 24px;
    font-weight: bold;
    font-size: 14px;
  }
`;

export const TransactionsList = styled.ul`
  list-style: none;

  ${ModalDialog} & {
    font-size: 85%;
  }
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    margin: 0;
    padding: 0;
    flex-flow: column;
    max-height: 130px;
    overflow-y: auto;
  }
`;

export const TransactionsListItem = styled.li`
  ${ModalDialog} & {
    flex-flow: column;

    &:not(:last-child) {
      padding-bottom: 3px;
      border-bottom: 1px solid ${colors['medium-very-light'] as string};
    }
  }

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    align-items: center;
    line-height: 24px;
    flex: 0 0 24px;

    input {
      padding: 0 0 0 1px;
      font-size: 12px;
      height: 22px;
      line-height: 22px;
      border: 1px solid #ccc;
      box-shadow: none;
    }
  }
`;

export const TransactionCol = styled.span`
  ${breakpoint(breakpoints.mobile)} {
    display: block;
  }
`;
export const TransactionLabel = styled(TransactionCol)`
  ${breakpoint(breakpoints.mobile)} {
    display: none;
  }
`;

export const ModalHeadColumn = styled.span`
  ${breakpoint(breakpoints.mobile)} {
    margin-left: 0;
    text-align: left;
  }
`;

const transactionItem = (width: number): FlattenSimpleInterpolation => css`
  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${width}px;

    &,
    ${TransactionCol}, input {
      width: ${width}px;
    }
  }
`;

export const TransactionRow = styled.span`
  ${ModalDialog} & {
    display: flex;
    flex-flow: row nowrap;
  }

  ${breakpoint(breakpoints.mobile)} {
    margin: 0;
  }
`;

export const TransactionRowButton = styled(TransactionRow)`
  ${breakpoint(breakpoints.mobile)} {
    button {
      margin-top: 3px;
    }
  }
`;

export const TransactionRowDate = styled(TransactionRow)`
  ${transactionItem(transactionsWidthDate)};
`;
export const TransactionRowUnits = styled(TransactionRow)`
  ${transactionItem(transactionsWidthUnits)};
`;
export const TransactionRowCost = styled(TransactionRow)`
  ${transactionItem(transactionsWidthCost)};
`;

export const ModalHeadDate = styled(ModalHeadColumn)`
  ${transactionItem(transactionsWidthDate)};
`;
export const ModalHeadUnits = styled(ModalHeadColumn)`
  ${transactionItem(transactionsWidthUnits)};
`;
export const ModalHeadCost = styled(ModalHeadColumn)`
  ${transactionItem(transactionsWidthCost)};
`;

export const NumTransactions = styled.span<{ active?: boolean }>`
  display: block;
  text-align: center;

  ${ModalDialog} & {
    display: none;
  }
  ${breakpoint(breakpoints.mobile)} {
    ${({ active }): undefined | false | FlattenSimpleInterpolation =>
      active &&
      css`
        z-index: 1;
      `}
  }
`;

export const NetWorthValue = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;

  ${EditByCategory} & {
    flex: 3;
  }
  ${AddByCategoryValue} & {
    margin: 0 10px;
    flex: 2;
  }
`;

export const NetWorthValueComplexToggle = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
  font-size: 12px;
`;

export const NetWorthValueList = styled.ul`
  margin: 0 6px 0 0;
  padding: 0;
  flex: 1;
  list-style: none;
`;

export const NetWorthValueComplex = styled.li<{ add: boolean }>`
  display: flex;
  select {
    flex: 0 0 60px;
  }

  ${({ add }): false | FlattenSimpleInterpolation =>
    add &&
    css`
      margin-top: 3px;
      padding: 3px 0;
      background: rgba(200, 200, 200, 0.3);
    `}

  ${FormField} {
    flex: 0 0 64px;
    input {
      width: 64px;
    }
  }
`;
