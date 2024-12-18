import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem, rgba } from 'polished';

import { fieldSizes } from '~client/components/page-funds/styles';
import { GRAPH_FUND_ITEM_WIDTH } from '~client/constants';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const containerWidth =
  fieldSizes.item + fieldSizes.transactions + 22 + 24 + GRAPH_FUND_ITEM_WIDTH + 200;

export const Container = styled.div`
  display: block;
  height: ${rem(48)};
  overflow-x: hidden;
  position: relative;
  user-select: none;
  width: 100%;
  ${breakpoint(breakpoints.tabletSmall)} {
    white-space: nowrap;
    width: ${rem(containerWidth)};
  }
`;

export type FractionProps = {
  fraction: number;
};

type AdjustmentProps = {
  direction: -1 | 1;
};

export const Adjustment = styled.div<AdjustmentProps>(
  ({ direction }) => css`
    border-bottom: 4px solid ${direction === 1 ? colors.profit.dark : colors.loss.dark};
    bottom: 0;
    display: flex;
    height: 4px;
    ${direction === 1 ? `left: 0;` : `right: 0;`};
    position: absolute;

    ${breakpoint(breakpoints.mobile)} {
      align-items: flex-end;
      height: ${rem(12)};
    }
  `,
);

export const AdjustmentSection = styled.div`
  border-left: 1px solid ${colors.white};
  flex: 1;
  height: 4px;
  margin-bottom: -4px;

  &:first-of-type {
    border-left: none;
  }
`;

export const Actual = styled.div<FractionProps>(
  ({ fraction }) => css`
    align-items: center;
    display: flex;
    flex-flow: column;
    float: left;
    font-size: ${rem(12)};
    height: 100%;
    position: relative;
    justify-content: center;

    ${fraction < 0.1 &&
    css`
      span {
        font-size: ${rem(8)};
        transform: rotate(-90deg);
      }
    `};

    ${breakpoint(breakpoints.mobile)} {
      padding-bottom: ${rem(4)};
      span {
        font-size: ${rem(fraction < 0.05 ? 8 : 12)};
      }
    }
  `,
);

type TargetProps = { isCash?: boolean };

export const Target = styled.div<TargetProps>(
  ({ isCash }) => css`
    border-right: 1px dashed ${colors.light.mediumDark};
    cursor: col-resize;
    height: ${rem(48)};
    position: absolute;
    border-right-width: ${isCash ? 2 : 1}px;
    top: 0;
    z-index: ${isCash ? 11 : 10};
  `,
);

export const Preview = styled.div`
  align-items: center;
  background: ${rgba(colors.amber, 0.8)};
  border-radius: 0 ${rem(10)} 0 0;
  display: inline-flex;
  height: ${rem(24)};
  padding: ${rem(4)} ${rem(10)};
  font-size: ${rem(10)};
  left: 0;
  margin-top: ${rem(-24)};
  position: fixed;
  z-index: 12;

  ${breakpoint(breakpoints.mobile)} {
    border-radius: 0 0 ${rem(10)} 0;
    margin-top: 0;
  }
`;
