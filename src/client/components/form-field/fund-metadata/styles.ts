import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import * as StyledCommon from '../metadata/styles';

import { FormField } from '~client/components/form-field/styles';
import { breakpoint } from '~client/styled/mixins';
import { Flex } from '~client/styled/shared';
import { ButtonUnStyled } from '~client/styled/shared/reset';
import { breakpoints, colors } from '~client/styled/variables';

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

    &:active, &:focus {
      background: ${colors.light.mediumDark} !important;
    }
  `,
);

const stockSplitsWidthDate = 150;
const stockSplitsWidthRatio = 100;

const transactionsWidthDate = 104;
const transactionsWidthUnits = 84;
const transactionsWidthPrice = 84;

export const TransactionLabel = styled(StyledCommon.ComponentCol)`
  flex: 0 0 ${rem(transactionsWidthDate)};
`;

export const StockSplitRowDate = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(stockSplitsWidthDate)};
`;
export const StockSplitRowRatio = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(stockSplitsWidthRatio)};
`;

export const TransactionRowDate = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(transactionsWidthDate)};
`;
export const TransactionRowUnits = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(transactionsWidthUnits)};
`;
export const TransactionRowPrice = styled(StyledCommon.ComponentRow)`
  ${StyledCommon.componentItem(transactionsWidthPrice)};
`;

export const TransactionInlineDRIP = styled.div`
  display: flex;
  font-size: ${rem(11)};
  & > span {
    flex: 1;
  }
  & > div {
    border: none !important;
    display: inline !important;
    width: auto !important;
  }
  input[type='checkbox'] {
    height: auto !important;
    width: auto;
  }
`;

export const TransactionRowSmall = styled(StyledCommon.ComponentRow)`
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

export const ModalHeadStockSplitDate = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(stockSplitsWidthDate)};
`;
export const ModalHeadRatio = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(stockSplitsWidthRatio)};
`;
export const ModalHeadTransactionDate = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(transactionsWidthDate)};
`;
export const ModalHeadUnits = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(transactionsWidthUnits)};
`;
export const ModalHeadPrice = styled(StyledCommon.ModalHeadColumn)`
  ${StyledCommon.componentItem(transactionsWidthPrice)};
`;
