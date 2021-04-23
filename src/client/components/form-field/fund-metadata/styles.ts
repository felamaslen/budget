import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { FormField } from '~client/components/form-field/styles';
import { ModalDialog } from '~client/components/modal-dialog/styles';
import { breakpoint } from '~client/styled/mixins';
import { Flex } from '~client/styled/shared';
import { ButtonUnStyled } from '~client/styled/shared/reset';
import { breakpoints, colors } from '~client/styled/variables';

export const ModalHead = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    line-height: 24px;
    font-weight: bold;
    font-size: 14px;
  }
`;

export const ModalHeadColumn = styled.span`
  ${breakpoint(breakpoints.mobile)} {
    margin-left: 0;
    text-align: left;
  }
`;

export const TabBar = styled(Flex)`
  background: ${colors.light.light};
  border-bottom: 1px solid ${colors.light.mediumLight};
  line-height: ${rem(22)};
`;

export const TabButton = styled(ButtonUnStyled)<{ active?: boolean }>(
  ({ active = false }) => css`
    background: ${active ? colors.light.mediumLight : 'none'} !important;
    cursor: ${active ? 'default' : 'pointer'};
    display: block;
    flex: 0 0 auto;
    height: 100%;
    font-weight: ${active ? 'bold' : 'normal'};
    margin: 0;

    ${!active &&
    css`
      &:hover,
      &:active {
        background: ${colors.light.mediumLight} !important;
      }
    `}
  `,
);

// Col, Label, Fields only used on modal (mobile) dialog
export const ComponentCol = styled.span`
  flex: 1;
  padding-right: ${rem(4)};

  input {
    width: 100%;
  }
`;

export const ComponentFields = styled.div`
  flex: 1;
`;

export const ComponentRow = styled.div`
  ${ModalDialog} & {
    display: flex;
    flex-flow: row nowrap;
  }

  ${breakpoint(breakpoints.mobile)} {
    margin: 0;
  }
`;

const stockSplitsWidthDate = 150;
const stockSplitsWidthRatio = 100;

const transactionsWidthDate = 104;
const transactionsWidthUnits = 84;
const transactionsWidthPrice = 84;

const componentItem = (width: number): SerializedStyles => css`
  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${width}px;

    &,
    ${ComponentCol}, input {
      width: ${width}px;
    }
  }
`;

export const TransactionLabel = styled(ComponentCol)`
  flex: 0 0 ${rem(transactionsWidthDate)};
`;

export const ComponentRowButton = styled(ComponentRow)`
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

export const StockSplitRowDate = styled(ComponentRow)`
  ${componentItem(stockSplitsWidthDate)};
`;
export const StockSplitRowRatio = styled(ComponentRow)`
  ${componentItem(stockSplitsWidthRatio)};
`;

export const TransactionRowDate = styled(ComponentRow)`
  ${componentItem(transactionsWidthDate)};
`;
export const TransactionRowUnits = styled(ComponentRow)`
  ${componentItem(transactionsWidthUnits)};
`;
export const TransactionRowPrice = styled(ComponentRow)`
  ${componentItem(transactionsWidthPrice)};
`;

export const TransactionRowFees = styled(ComponentRow)`
  font-size: ${rem(13)};
  ${FormField} {
    font-size: inherit;
  }

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    font-size: ${rem(11)};
  }
`;

export const UnitsPriceRow = styled.div`
  display: flex;
`;

export const FeesLabel = styled.span`
  flex: 0 0 ${rem(32)};
  font-weight: bold;
`;

export const NumTransactions = styled.button<{ active?: boolean }>(
  ({ active }) => css`
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

      ${active && `z-index: 1;`}
    }
  `,
);

export const ModalHeadStockSplitDate = styled(ModalHeadColumn)`
  ${componentItem(stockSplitsWidthDate)};
`;
export const ModalHeadRatio = styled(ModalHeadColumn)`
  ${componentItem(stockSplitsWidthRatio)};
`;
export const ModalHeadTransactionDate = styled(ModalHeadColumn)`
  ${componentItem(transactionsWidthDate)};
`;
export const ModalHeadUnits = styled(ModalHeadColumn)`
  ${componentItem(transactionsWidthUnits)};
`;
export const ModalHeadPrice = styled(ModalHeadColumn)`
  ${componentItem(transactionsWidthPrice)};
`;

export const ComponentModal = styled.div`
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
    max-height: ${rem(304)};
  }
`;

export const ComponentList = styled.ul`
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
    max-height: ${rem(304)};
    overflow-y: auto;
  }
`;

export const ComponentListItem = styled.li`
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

    &:not(:last-child) {
      border-bottom: 1px solid ${colors.light.mediumDark};
      padding-bottom: ${rem(2)};
    }

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
