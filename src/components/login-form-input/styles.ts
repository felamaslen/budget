import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { breakpoints, colors } from '~/styled/variables';
import { breakpoint, rem } from '~/styled/mixins';
import { FlexCenter, RowSingleLine } from '~/styled/layout';
import { H3 } from '~/styled/typography';

export const Box = styled.div`
  width: ${rem(240)};
  height: ${rem(300)};
  text-align: center;
  background: ${colors.backgroundDark};
  border-radius: 4px;
  box-shadow: 0 26px 90px ${colors.shadowDark};

  ${breakpoint(breakpoints.mobile)} {
    width: ${rem(300)};
    height: ${rem(450)};
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
    height: 80px;
  }
`;
