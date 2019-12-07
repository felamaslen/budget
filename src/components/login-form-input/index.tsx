import React, { SFC } from 'react';

import Button from '~/components/core/button';
import * as Styled from './styles';

type OnInput = (value: number) => void;

interface LoginFormInputProps {
  pin: string;
  onInput: OnInput;
  length: number;
}

const getDigit = (row: number, col: number): number => (row * 3 + col + 1) % 10;

const Digit: SFC<{ onInput: OnInput; digit: number }> = ({ digit, onInput }) => (
  <Styled.Digit digit={digit}>
    <Button action={(): void => onInput(digit)}>{digit}</Button>
  </Styled.Digit>
);

const InputPad: SFC<{ onInput: OnInput }> = ({ onInput }) => (
  <Styled.InputPad>
    {new Array(4).fill(0).map((item, row) => {
      if (row === 3) {
        return (
          <Styled.InputRow key={row}>
            <Digit onInput={onInput} digit={0} />
          </Styled.InputRow>
        );
      }

      return (
        <Styled.InputRow key={row}>
          {new Array(3).fill(0).map((colItem, col) => (
            <Digit key={getDigit(row, col)} digit={getDigit(row, col)} onInput={onInput} />
          ))}
        </Styled.InputRow>
      );
    })}
  </Styled.InputPad>
);

const LoginFormInput: SFC<LoginFormInputProps> = ({ pin, onInput, length }) => {
  return (
    <Styled.Box>
      <Styled.Title>{'Enter your PIN:'}</Styled.Title>
      <Styled.PinDisplay>
        {new Array(length).fill(0).map((item, index) => (
          <Styled.InputPin
            key={index}
            isActive={index === pin.length}
            isDone={index < pin.length}
          />
        ))}
      </Styled.PinDisplay>
      <InputPad onInput={onInput} />
    </Styled.Box>
  );
};

export default LoginFormInput;
