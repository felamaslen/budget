import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { Button, FlexCenter, H3 } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';

export const TitleContainer = styled(FlexCenter)`
  display: flex;
  justify-content: space-between;
  margin: 0 ${rem(4)};

  ${breakpoint(breakpoints.mobile)} {
    margin: 0 ${rem(8)} 0 ${rem(18)};
  }
`;

export const Title = styled(H3)`
  margin: 0;
  height: 48px;
  line-height: 48px;
  font-size: 24px;
  text-align: center;
  color: ${colors.light.light};
  white-space: nowrap;

  ${breakpoint(breakpoints.mobile)} {
    height: 60px;
    line-height: 60px;
  }
`;

export const SpinnerSpace = styled(FlexCenter)`
  flex: 0 0 ${rem(48)};
  justify-content: center;
`;

export const Form = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const FormInner = styled.div`
  width: 240px;
  height: 300px;
  background: ${colors.dark.dark};
  border-radius: 4px;
  box-shadow: 0 26px 90px ${colors.shadow.dark};

  ${breakpoint(breakpoints.mobile)} {
    width: 300px;
    height: 450px;
  }
`;

export const NumberInputPad = styled.div`
  display: grid;
  padding: 0 ${rem(6)} ${rem(12)} ${rem(6)};
  grid-template-rows: auto auto auto auto;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: ${rem(12)};
  height: 170px;
  background: ${colors.translucent.dark.mediumDark};
  box-shadow: inset 0 0 13px ${colors.shadow.mediumLight};

  user-select: none;
  ${breakpoint(breakpoints.mobile)} {
    height: 280px;
  }
`;

export const NumberInputRow = styled.div`
  display: grid;
  grid-template-columns: inherit;
  grid-column: 1 / span 3;
  grid-gap: 6px;
  &:nth-of-type(1) {
    grid-row: 1;
  }
  &:nth-of-type(2) {
    grid-row: 2;
  }
  &:nth-of-type(3) {
    grid-row: 3;
  }
  &:nth-of-type(4) {
    grid-row: 4;
  }
`;

export const Digit = styled(Button)<{ digit: number }>`
  display: block;
  margin: 0;
  padding: 0;
  height: 100%;
  grid-column: ${({ digit }): number => (digit === 0 ? 2 : 1 + ((digit - 1) % 3))};
  background-color: ${colors.medium.light} !important;
  background-image: linear-gradient(
      167deg,
      ${colors.translucent.dark.mediumLight} 50%,
      transparent 55%
    ),
    linear-gradient(to bottom, ${colors.translucent.dark.mediumDark}, transparent) !important;
  box-shadow: inset 0 0 0 1px ${colors.medium.light},
    inset 0 0 0 2px ${colors.translucent.dark.mediumDark}, 0 8px 0 0 ${colors.medium},
    0 8px 0 1px ${colors.shadow.mediumLight}, 0 8px 8px 1px ${colors.shadow.mediumLight} !important;
  color: ${colors.white};
  border: none;
  border-radius: 5px;
  font-family: 'Lucida Grande', Arial, sans-serif;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: -1px;
  position: relative;
  text-shadow: 0 1px 1px ${colors.shadow.mediumLight};
  transition: all linear 0.05s;

  &:active {
    box-shadow: inset 0 0 0 1px ${colors.medium},
      inset 0 0 0 2px ${colors.translucent.dark.mediumDark}, 0 0 0 1px ${colors.shadow.mediumLight};
    transform: translateY(10px);
  }

  ${breakpoint(breakpoints.mobile)} {
    height: 90%;
    font-size: 40px;
  }
`;

export const PinDisplay = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 10px;
  ${breakpoint(breakpoints.mobile)} {
    margin: 0 ${rem(12)} ${rem(16)} ${rem(12)};
  }
`;

type InputPinProps = { done: boolean };
const inputPinStyles = ({ done }: InputPinProps): SerializedStyles => css`
  background-color: ${colors.dark.light};
  flex: 1 0 0;
  font-size: ${rem(64)};
  height: ${rem(60)};
  margin: 0 ${rem(6)};
  position: relative;

  input {
    background-color: transparent;
    border: none;
    border-radius: 4px;
    color: ${colors.transparent};
    text-align: center;
    transition: background-color linear 0.1s;
    z-index: 2;

    &:focus {
      background-color: ${colors.light.light};
    }

    &,
    &:focus,
    &:active {
      outline: none;
    }

    appearance: none;
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      display: none;
      margin: 0;
    }
  }

  &::after {
    align-items: center;
    display: inline-flex;
    background-color: transparent;
    content: '•';
    color: ${colors.light.light};
    justify-content: center;
    opacity: 0;
    transition: opacity linear 0.1s;
    z-index: 1;
  }

  input,
  &::after {
    font: inherit;
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
  }

  ${done &&
  css`
    &::after {
      opacity: 1;
    }
  `}

  ${breakpoint(breakpoints.mobile)} {
    height: ${rem(80)};
  }
`;

export const InputPin = styled.div<InputPinProps>(inputPinStyles);
