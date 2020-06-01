import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NumberInputPad } from './number-input-pad';
import { PinDisplay } from './pin-display';
import * as Styled from './styles';
import { loginRequested, errorOpened } from '~client/actions';
import { LOGIN_INPUT_LENGTH } from '~client/constants/data';
import { ErrorLevel } from '~client/constants/error';
import { getLoggedIn, getInitialised, loginLoading } from '~client/selectors';

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch();

  const initialised = useSelector(getInitialised);
  const loading = useSelector(loginLoading);
  const loggedIn = useSelector(getLoggedIn);

  const onLogin = useCallback((pin: number) => dispatch(loginRequested(pin)), [dispatch]);
  const onWarn = useCallback((message: string) => dispatch(errorOpened(message, ErrorLevel.Warn)), [
    dispatch,
  ]);

  const [pin, setPin] = useState<number[]>([]);
  const onInput = useCallback((value: number, index?: number): void => {
    setPin((last) => {
      const pinIndex = index ?? last.length;
      return pinIndex > last.length ? last : [...last.slice(0, pinIndex), value];
    });
  }, []);

  const inputStep = pin.length;
  const hasFullPin = pin.length >= LOGIN_INPUT_LENGTH;

  useEffect(() => {
    if (!loggedIn && !loading && hasFullPin) {
      const pinAsNumber = pin.reduce(
        (last, value, index) => last + value * 10 ** (pin.length - 1 - index),
        0,
      );
      if (pinAsNumber > 999) {
        onLogin(pinAsNumber);
      } else {
        onWarn('Pin must not start with zero');
      }
      setPin([]);
    }
  }, [loggedIn, loading, hasFullPin, onLogin, onWarn, pin]);

  const onFocus = useCallback((index: number) => {
    setPin((last) => last.slice(0, index));
  }, []);

  if (loggedIn || !initialised) {
    return null;
  }

  return (
    <Styled.Form>
      <Styled.FormInner>
        <Styled.Title>Enter your PIN:</Styled.Title>
        <PinDisplay inputStep={inputStep} onFocus={onFocus} onInput={onInput} />
        <NumberInputPad onInput={onInput} />
      </Styled.FormInner>
    </Styled.Form>
  );
};
