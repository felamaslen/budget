import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import {
  Row as AccessibleRow,
  fieldSizes,
  borderColor,
} from '~client/components/accessible-list/styles';
import { ModalDialog, FormRowInner } from '~client/components/modal-dialog/styles';
import { CategoryItemForm as NetWorthCategoryItemForm } from '~client/components/net-worth/category-list/styles';
import {
  EditByCategory,
  EditByCategoryValue,
  AddByCategoryValue,
  AddCurrency,
} from '~client/components/net-worth/edit-form/styles';
import { PageFunds, fieldSizes as fundFieldSizes } from '~client/components/page-funds/styles';
import { breakpoint, rem } from '~client/styled/mixins';
import { fontFamily } from '~client/styled/reset';
import { breakpoints, colors } from '~client/styled/variables';

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
  display: flex;
  position: relative;
  align-items: center;
  font-size: ${rem(13)};
  font-family: sans-serif;

  & > span {
    display: inline-flex;
    font-size: inherit;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
  & > input {
    font-family: inherit;
    font-size: inherit;
  }

  ${breakpoint(breakpoints.mobile)} {
    opacity: ${({ small, active }): number => (small && !active ? 0.3 : 1)};

    ${AccessibleRow} & {
      display: inline-flex;
      font-family: ${fontFamily};
      font-size: ${rem(16)};
      width: ${({ item }): string => {
        if (item === 'date') {
          return rem(fieldSizes.date);
        }
        if (item === 'cost') {
          return rem(fieldSizes.cost);
        }
        return rem(fieldSizes.default);
      }};

      & > span {
        position: static;
        width: ${rem(8)};
      }

      input {
        font: inherit;
        color: inherit;
        height: inherit;
      }
    }

    ${PageFunds} & {
      width: ${({ item }): string => rem(Reflect.get(fundFieldSizes, item) ?? 0)};
      border-bottom: 1px solid ${borderColor};
    }
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
        input {
          margin: 0;
          padding-left: 0;
          padding-right: 0;
        }
      }
    `}

  ${NetWorthCategoryItemForm} & {
    ${({ item }): false | FlattenSimpleInterpolation =>
      ['type', 'category', 'color'].includes(item) && centerGridOne};
    ${({ item }): false | FlattenSimpleInterpolation =>
      item === 'category' &&
      css`
        ${breakpoint(breakpoints.mobile)} {
          padding: 0 ${rem(4)};
          border: none;
          outline: none;
          font-size: ${rem(18)};
          width: 100%;

          input {
            width: 100%;
            font-size: ${rem(16)};
          }
        }
      `};
  }

  ${ModalDialog} & {
    display: flex;
    flex-basis: 0;
    flex-grow: 2;
    border: 0;
    line-height: 28px;
    font-size: ${rem(16)};
    position: relative;

    ${({ name, invalid }): false | FlattenSimpleInterpolation =>
      name !== 'transactions' &&
      css`
        & > input {
          border: none;
          line-height: 28px;
          outline: none;
          width: 100%;
        }

        &::after {
          border: 1px solid ${invalid ? colors.error : colors.light.mediumDark};
          border-top: none;
          content: '';
          display: block;
          height: ${rem(4)};
          margin-top: ${rem(-4)};
          position: absolute;
          top: 100%;
          width: 100%;
        }
      `};

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

const transactionsWidthDate = 104;
const transactionsWidthUnits = 72;
const transactionsWidthCost = 80;

export const TransactionsModal = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.translucent.light.mediumLight};
    border-right: 1px solid ${colors.light.mediumDark};
    border-bottom: 1px solid ${colors.light.mediumDark};
    box-shadow: 0 3px 6px ${colors.shadow.light};
    position: absolute;
    top: 100%;
    z-index: 5;

    ${FormField} {
      border: 1px solid ${colors.light.mediumLight};
      font-size: ${rem(14)};
      width: 100%;

      input {
        border-right: none;
        &:not(:last-child) {
          margin-right: ${rem(4)};
        }
      }
    }
  }
`;

export const ModalInner = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    flex-flow: column;
    max-height: ${rem(192)};
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
    font-size: 95%;
    padding: 0 0 ${rem(8)} ${rem(4)};
    margin: 0;
    width: 100%;
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
    display: flex;
    flex-flow: row;

    & > div {
      display: flex;
      flex-flow: column;
    }

    &:not(:last-child) {
      padding-bottom: 3px;
      border-bottom: 1px dotted ${colors.light.mediumDark};
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

// Col, Label, Fields only used on modal (mobile) dialog
export const TransactionCol = styled.span`
  flex: 1;
  padding-right: ${rem(4)};

  input {
    width: 100%;
  }
`;
export const TransactionLabel = styled(TransactionCol)`
  flex: 0 0 ${rem(104)};
`;

export const TransactionFields = styled.div`
  flex: 1;
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

export const TransactionRow = styled.div`
  ${ModalDialog} & {
    display: flex;
    flex-flow: row nowrap;
  }

  ${breakpoint(breakpoints.mobile)} {
    margin: 0;
  }
`;

export const TransactionRowButton = styled(TransactionRow)`
  ${ModalDialog} & {
    align-items: center;
    display: flex;
    flex: 0 0 ${rem(32)};
    justify-content: center;

    button {
      border-radius: 100%;
      flex: 0 0 ${rem(24)};
      height: ${rem(24)};
      margin: 0;
      padding: 0;
      width: ${rem(24)};
    }
  }
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

export const NumTransactions = styled.button<{ active?: boolean }>`
  display: none;

  ${breakpoint(breakpoints.mobile)} {
    background: none;
    border: none;
    border-right: 1px solid ${colors.light.mediumDark};
    color: inherit;
    display: block;
    font: inherit;
    height: 100%;
    margin: 0;
    outline: none;
    padding: 0;
    text-align: center;
    width: 100%;

    &:focus {
      box-shadow: inset 0 0 1px 1px ${colors.blue};
    }

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

  ${EditByCategory} &,
  ${AddByCategoryValue} & {
    display: grid;

    input[type="number"] {
      width: 100%;
    }

    ${breakpoint(breakpoints.mobile)} {
      input[type="number"] {
        width: ${rem(96)};
      }
    }
  }

  ${EditByCategory} & {
    flex: 3;
  }

  ${AddByCategoryValue} & {
    ${breakpoint(breakpoints.mobile)} {
      display: block;
      margin: 0 ${rem(24)};
      flex: 2;
    }
  }
`;

export const NetWorthValueFXToggle = styled.span`
  align-items: center;
  display: inline-flex;
  font-size: ${rem(12)};
  grid-row: 1;

  ${breakpoint(breakpoints.mobile)} {
    align-items: center;
    margin-right: ${rem(6)};
  }
`;

export const NetWorthValueList = styled.ul`
  margin: 0 6px 0 0;
  padding: 0;
  flex: 1;
  list-style: none;
`;

export const NetWorthValueFX = styled.li<{ add: boolean }>`
  display: flex;
  select {
    width: 100%;
  }

  ${({ add }): false | FlattenSimpleInterpolation =>
    add &&
    css`
      margin-top: 3px;
      padding: 3px 0;
      background: ${colors.translucent.dark.light};
    `}

  ${FormField} {
    flex: 0 0 ${rem(40)};
    input {
      width: ${rem(40)};
    }
  }

  ${breakpoint(breakpoints.mobile)} {
    ${FormField} {
      flex: 0 0 ${rem(60)};
    }
  }
`;

export const NetWorthValueOption = styled.div`
  display: flex;
  flex-flow: column;

  input[type='number'] {
    font-size: ${rem(12)};
    width: ${rem(64)};
  }
  & > div {
    display: flex;
    margin-bottom: ${rem(4)};
    align-items: flex-end;
    font-size: ${rem(12)};
  }
  label {
    flex: 0 0 ${rem(100)};
    &::after {
      content: ':';
    }
  }

  ${EditByCategoryValue} &,
  ${AddByCategoryValue} & {
    grid-column: 2 !important;
    grid-row: 1 / span 3;

    input[type="number"] {
      width: ${rem(96)};
    }
  }

  ${EditByCategoryValue} & {
  }

  ${AddByCategoryValue} & {
  }
`;
