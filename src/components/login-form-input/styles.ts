import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { breakpoints, colors } from '~/styled/variables';
import { breakpoint, rem } from '~/styled/mixins';
import { Grid, FlexCenter, RowSingleLine } from '~/styled/layout';
import { H3 } from '~/styled/typography';

export const Box = styled.div`
  width: ${rem(240)};
  text-align: center;
  background: ${colors.backgroundDark};
  border-radius: 4px;
  box-shadow: 0 26px 90px ${colors.shadowDark};

  ${breakpoint(breakpoints.mobile)} {
    width: ${rem(300)};
  }
`;

export const Title = styled(H3)`
  color: ${colors.textLight};
  ${breakpoint(breakpoints.mobile)} {
    line-height: ${rem(64)};
  }
`;

export const PinDisplay = styled(RowSingleLine)`
  margin-bottom: ${rem(8)};
  ${breakpoint(breakpoints.mobile)} {
    margin: 0 ${rem(12)} ${rem(16)} ${rem(12)};
  }
`;

interface InputPinProps {
  isActive: boolean;
  isDone: boolean;
}

export const InputPin = styled(FlexCenter)<InputPinProps>`
  flex-grow: 1;
  font-size: ${rem(64)};
  height: ${rem(60)};
  margin: 0 6px;
  border: none;
  border-radius: ${rem(4)};
  background-color: ${({ isActive }): string => (isActive ? colors.textLight : colors.textDark)};
  color: transparent;
  text-align: center;
  outline: none;
  transition: background-color linear 0.1s;

  ${({ isDone }): FlattenSimpleInterpolation =>
    isDone
      ? css`
          &::after {
            content: '';
            width: ${rem(16)};
            height: ${rem(16)};
            background: ${colors.textLight};
            border-radius: ${rem(16)};
            position: absolute;
          }
        `
      : css``};

  ${breakpoint(breakpoints.mobile)} {
    height: ${rem(80)};
  }
`;

const buttonHeight = rem(48);

export const InputPad = styled(Grid)`
  padding: ${rem(12)} ${rem(6)};
  grid-template-rows: repeat(4, buttonHeight);
  grid-template-columns: repeat(3, 1fr);
  grid-gap: ${rem(12)};
  background: ${colors.backgroundMediumDark};
  box-shadow: inset 0 0 13px ${colors.shadowMedium};
  user-select: none;
`;

export const InputRow = styled(Grid)`
  grid-template-columns: inherit;
  grid-column: 1 / span 3;
  grid-gap: ${rem(6)};
  &:nth-child(1) {
    grid-row: 1;
  }
  &:nth-child(2) {
    grid-row: 2;
  }
  &:nth-child(3) {
    grid-row: 3;
  }
  &:nth-child(4) {
    grid-row: 4;
  }
`;

interface DigitProps {
  digit: number;
}

export const Digit = styled(FlexCenter)<DigitProps>`
  margin: 0;
  padding: 0;
  height: ${buttonHeight};
  line-height: ${buttonHeight};
  font-size: ${rem(20)};
  grid-column: ${({ digit }): number => {
    if (digit === 0) {
      return 2;
    }

    return 1 + ((digit - 1) % 3);
  }};
  color: ${colors.white};
  border: none;
  border-radius: 5px;
  font-weight: bold;
  letter-spacing: -1px;
  position: relative;
  transition: all linear 0.05s;

  ${breakpoint(breakpoints.mobile)} {
    font-size: ${rem(24)};
  }
`;
