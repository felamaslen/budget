import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { rem, breakpoint } from '~client/styled/mixins';
import { Button } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';

export const Title = styled.h3`
  margin: 0;
  height: 48px;
  line-height: 48px;
  font-size: 24px;
  text-align: center;
  color: ${colors['very-light']};

  ${breakpoint(breakpoints.mobile)} {
    height: 60px;
    line-height: 60px;
  }
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
  background: ${colors['very-dark']};
  border-radius: 4px;
  box-shadow: 0 26px 90px ${colors['shadow-l8']};

  ${breakpoint(breakpoints.mobile)} {
    width: 300px;
    height: 450px;
  }
`;

export const NumberInputPad = styled.div`
  display: grid;
  padding: 0 6px 12px 6px;
  grid-template-rows: auto auto auto auto;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 12px;
  height: 170px;
  background: ${colors['translucent-l15']};
  box-shadow: inset 0 0 13px ${colors['shadow-l5']};

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

export const Digit = styled(Button)<{ digit: number }>`
  display: block;
  margin: 0;
  padding: 0;
  height: 100%;
  grid-column: ${({ digit }): number => (digit === 0 ? 2 : 1 + ((digit - 1) % 3))};
  background-color: ${colors['medium-light']} !important;
  background-image: linear-gradient(167deg, ${colors['translucent-l1']} 50%, transparent 55%),
    linear-gradient(to bottom, ${colors['translucent-l15']}, transparent) !important;
  box-shadow: inset 0 0 0 1px ${colors['medium-light']},
    inset 0 0 0 2px ${colors['translucent-l15']}, 0 8px 0 0 ${colors.medium},
    0 8px 0 1px ${colors['shadow-l4']}, 0 8px 8px 1px ${colors['shadow-l5']} !important;
  color: ${colors.white};
  border: none;
  border-radius: 5px;
  font-family: 'Lucida Grande', Arial, sans-serif;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: -1px;
  position: relative;
  text-shadow: 0 1px 1px ${colors['shadow-l5']};
  transition: all linear 0.05s;

  &:active {
    box-shadow: inset 0 0 0 1px ${colors.medium}, inset 0 0 0 2px ${colors['translucent-l15']},
      0 0 0 1px ${colors['shadow-l4']};
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
    margin: 0 12px 16px 12px;
  }
`;

export const InputPin = styled.div<{ done: boolean }>`
  background-color: ${colors['slightly-dark']};
  flex: 1 0 0;
  font-size: 64px;
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
      background-color: ${colors['very-light']};
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
      -webkit-apperance: none;
      display: none;
      margin: 0;
    }
  }

  &::after {
    align-items: center;
    display: inline-flex;
    background-color: transparent;
    content: '•';
    color: ${colors['very-light']};
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

  ${({ done }): false | FlattenSimpleInterpolation =>
    done &&
    css`
      &::after {
        opacity: 1;
      }
    `}

  ${breakpoint(breakpoints.mobile)} {
    height: ${rem(80)};
  }
`;
