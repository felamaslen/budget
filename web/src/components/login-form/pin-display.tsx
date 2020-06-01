import React, { useRef, useEffect, useCallback } from 'react';

import * as Styled from './styles';
import { LOGIN_INPUT_LENGTH } from '~client/constants/data';

type Props = {
  inputStep: number;
  onInput: (value: number, index: number) => void;
  onFocus: (index: number) => void;
};

const InputPin: React.FC<{
  digit: number;
  active: boolean;
  done: boolean;
  onInput: Props['onInput'];
  onFocus: Props['onFocus'];
}> = ({ digit, active, done, onInput, onFocus }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (active) {
      setImmediate(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  }, [active]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const value = Number(event.target.value);
      if (!Number.isNaN(value)) {
        onInput(value, digit);
      }
    },
    [digit, onInput],
  );

  const onFocusInput = useCallback(() => onFocus(digit), [digit, onFocus]);

  return (
    <Styled.InputPin done={done}>
      <input
        ref={inputRef}
        tabIndex={active || done ? 0 : -1}
        disabled={!active && !done}
        type="number"
        min={0}
        max={9}
        step={1}
        value=""
        onChange={onChange}
        onFocus={onFocusInput}
      />
    </Styled.InputPin>
  );
};

export const PinDisplay: React.FC<Props> = ({ inputStep, onInput, onFocus }) => (
  <Styled.PinDisplay>
    {Array(LOGIN_INPUT_LENGTH)
      .fill(0)
      .map((_, digit) => (
        <InputPin
          key={digit}
          digit={digit}
          active={digit === inputStep}
          onInput={onInput}
          onFocus={onFocus}
          done={digit < inputStep}
        />
      ))}
  </Styled.PinDisplay>
);
