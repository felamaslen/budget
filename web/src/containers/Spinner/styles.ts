import { darken } from 'polished';
import styled, { keyframes, Keyframes } from 'styled-components';
import { rem } from '~client/styled/mixins';
import { colors, sizes } from '~client/styled/variables';

const spin = (offset = 15): Keyframes => keyframes`
  from {
    transform: rotate(-${offset}deg);
  }
  to {
    transform: rotate(${360 - offset}deg);
  }
}
`;

export const Outer = styled.div<{ initialLoading: boolean }>`
  display: flex;
  position: fixed;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 500;
  top: ${sizes.navbarHeight}px;
  left: 0;
  background: ${({ initialLoading }): string =>
    initialLoading ? colors.translucent.light.mediumLight : colors.transparent};
`;

export const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${rem(128)};
  height: ${rem(128)};
  position: relative;
  font-size: 6px;
  background: ${colors.white};
  border-radius: 2em;
  box-shadow: inset 0 0 19px -3px ${colors.shadow.light};
`;

const progressWidth = 80;

export const Progress = styled.div<{ offset: number }>`
  display: inline-block;
  position: absolute;
  width: ${rem(progressWidth)};
  height: ${rem(progressWidth)};
  text-indent: -1000px;
  overflow: hidden;
  animation: ${({ offset }): Keyframes => spin(offset)} 1s infinite steps(8);

  &::before,
  &::after {
    content: '';
    width: ${rem(progressWidth / 10)};
    height: ${rem(progressWidth * 0.3)};
    position: absolute;
    top: 0;
    left: ${rem((progressWidth - 8) / 2)};
    border-radius: 2px;
    background: ${colors.light.mediumLight};
    box-shadow: 0 ${rem(progressWidth * 0.7)} ${colors.light.mediumLight};
    transform-origin: 50% ${rem(progressWidth / 2)};
  }

  &::before {
    background: ${({ offset }): string =>
      darken(0.8 - (offset / 360) * 1.5, colors.light.mediumLight)};
  }
  &::after {
    transform: rotate(-45deg);
    background: ${({ offset }): string =>
      darken(0.8 - ((offset + 45) / 360) * 1.5, colors.light.mediumLight)};
  }
`;
