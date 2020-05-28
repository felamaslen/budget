import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as Styled from './styles';
import { loginRequested } from '~client/actions/login';
import NumberInputPad from '~client/components/LoginForm/number-input-pad';
import PinDisplay from '~client/components/LoginForm/pin-display';
import { LOGIN_INPUT_LENGTH } from '~client/constants/data';
import { getLoggedIn, getInitialised, loginLoading } from '~client/selectors';

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch();

  const initialised = useSelector(getInitialised);
  const loading = useSelector(loginLoading);
  const loggedIn = useSelector(getLoggedIn);

  const onLogin = useCallback((pin: number) => dispatch(loginRequested(pin)), [dispatch]);

  const [pin, setPin] = useState('');
  const onInput = useCallback((digit) => setPin((last) => `${last}${digit}`), []);

  const onKeydown = useCallback(
    (event) => {
      if (!Number.isNaN(Number(event.key))) {
        onInput(event.key);
      }
    },
    [onInput],
  );

  useEffect(() => {
    if (loggedIn) {
      window.removeEventListener('keydown', onKeydown);
    } else {
      window.addEventListener('keydown', onKeydown);
    }

    return (): void => window.removeEventListener('keydown', onKeydown);
  }, [loggedIn, onKeydown]);

  const inputStep = pin.length;

  useEffect(() => {
    if (!loggedIn && !loading && pin.length >= LOGIN_INPUT_LENGTH) {
      onLogin(Number(pin));
      setPin('');
    }
  }, [loggedIn, loading, onLogin, pin]);

  if (loggedIn || !initialised) {
    return null;
  }

  return (
    <Styled.Form>
      <Styled.FormInner>
        <Styled.Title>{'Enter your PIN:'}</Styled.Title>
        <PinDisplay inputStep={inputStep} />
        <NumberInputPad onInput={onInput} />
      </Styled.FormInner>
    </Styled.Form>
  );
};
