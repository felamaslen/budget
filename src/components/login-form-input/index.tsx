import React from 'react';

import * as Styled from './styles';

interface LoginFormInputProps {
  pin: string;
  setPin: (value: string) => void;
  length: number;
}

export default function LoginFormInput({ pin, setPin, length }: LoginFormInputProps) {
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
    </Styled.Box>
  );
}
