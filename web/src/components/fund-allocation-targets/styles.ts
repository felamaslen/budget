import { rgba } from 'polished';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { graphFundItemWidth } from '~client/components/graph-fund-item/styles';
import { fieldSizes } from '~client/components/page-funds/styles';
import { rem, breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

const containerWidth = fieldSizes.item + fieldSizes.transactions + 22 + graphFundItemWidth + 200;

export const Container = styled.div`
  display: block;
  position: relative;
  width: 100%;
  ${breakpoint(breakpoints.tabletSmall)} {
    height: ${rem(48)};
    white-space: nowrap;
    width: ${rem(containerWidth)};
    user-select: none;
  }
`;

type FractionProps = {
  fraction: number;
};

type AdjustmentProps = FractionProps & {
  direction: -1 | 1;
};

export const Adjustment = styled.div.attrs(({ fraction }: AdjustmentProps) => ({
  style: {
    width: rem(fraction * containerWidth),
  },
}))<AdjustmentProps>`
  display: none;

  ${breakpoint(breakpoints.mobile)} {
    align-items: flex-end;
    border-bottom: 4px solid
      ${({ direction }): string => (direction === 1 ? colors.profit.dark : colors.loss.dark)};
    bottom: 0;
    display: flex;
    height: ${rem(12)};
    position: absolute;

    ${({ direction }): FlattenSimpleInterpolation =>
      direction === 1
        ? css`
            left: 0;
          `
        : css`
            right: 0;
          `};
  }
`;

export const AdjustmentSection = styled.div`
  border-left: 1px solid ${colors.white};
  flex: 1;
  height: 4px;
  margin-bottom: -4px;

  &:first-child {
    border-left: none;
  }
`;

type ActualProps = FractionProps & {
  color: string;
};

export const Actual = styled.div.attrs(({ fraction, color }: ActualProps) => ({
  style: {
    backgroundColor: rgba(color, 0.2),
    width: `${fraction * 100}%`,
  },
}))<ActualProps>`
  align-items: center;
  display: flex;
  flex-flow: column;
  float: left;
  font-size: ${({ fraction }): string => rem(fraction < 0.05 ? 8 : 12)};
  height: 100%;
  position: relative;
  justify-content: center;

  ${({ fraction }): false | FlattenSimpleInterpolation =>
    fraction < 0.1 &&
    css`
      span {
        transform: rotate(-90deg);
      }
    `};

  ${breakpoint(breakpoints.mobile)} {
    padding-bottom: ${rem(4)};
  }
`;

type TargetProps = ActualProps & {
  delta: number;
  isCash?: boolean;
};

export const Target = styled.div.attrs(({ fraction, color, delta }: TargetProps) => ({
  style: {
    borderColor: color,
    left: `${fraction * 100}%`,
    marginLeft: delta - 4,
  },
}))<TargetProps>`
  border-right: 1px dashed ${colors.light.mediumDark};
  cursor: col-resize;
  height: 100%;
  position: absolute;
  border-right-width: ${({ isCash }): number => (isCash ? 2 : 1)}px;
  top: 0;
  z-index: ${({ isCash }): number => (isCash ? 11 : 10)};
`;

export const Preview = styled.div`
  align-items: center;
  display: none;
  background: ${rgba(colors.amber, 0.8)};
  border-radius: 0 0 ${rem(10)} 0;
  height: ${rem(24)};
  padding: ${rem(4)} ${rem(10)};
  font-size: ${rem(10)};
  left: 0;
  position: absolute;
  top: 0;
  z-index: 12;

  ${breakpoint(breakpoints.mobile)} {
    display: inline-flex;
  }
`;
