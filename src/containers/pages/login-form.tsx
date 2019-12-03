import React, { KeyboardEvent, useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '~/reducers';
import { loginRequested, LoginRequestAction } from '~/actions/login';
import { getLoggedIn } from '~/selectors/login';

import { FlexCenter } from '~/styled/layout';
import LoginFormInput from '~/components/login-form-input';

interface LoginFormProps {
  isLoggedIn: boolean;
  onLogin: (pin: string) => LoginRequestAction;
}

const pinLength = 4;

function LoginForm({ isLoggedIn, onLogin }: LoginFormProps) {
  const [pin, setPin] = useState<string>('');
  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (!Number.isNaN(Number(event.key))) {
        setPin((last: string) => `${last}${event.key}`);
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn && pin.length === pinLength) {
      onLogin(pin);
      setPin('');
    }
  }, [isLoggedIn, pin, onLogin]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <FlexCenter>
      <LoginFormInput pin={pin} setPin={setPin} length={pinLength} />
    </FlexCenter>
  );
}

const mapStateToProps = (state: GlobalState) => ({
  isLoggedIn: getLoggedIn(state),
});

const mapDispatchToProps = {
  onLogin: loginRequested,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
