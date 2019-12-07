import React, { SFC, useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '~/reducers';
import { loginRequested, LoginRequestAction } from '~/actions/login';
import { getLoggedIn } from '~/selectors/login';

import { FlexCenter } from '~/styled/layout';
import LoginFormInput from '~/components/login-form-input';

interface StateProps {
  isLoggedIn: boolean;
}

interface DispatchProps {
  onLogin: (pin: string) => LoginRequestAction;
}

interface LoginFormProps extends StateProps, DispatchProps {}

const pinLength = 4;

interface NativeKeyboardEvent {
  key: string;
}

const LoginForm: SFC<LoginFormProps> = ({ isLoggedIn, onLogin }) => {
  const [pin, setPin] = useState<string>('');
  const onInput = useCallback((digit: number) => setPin(last => `${last}${digit}`), []);

  useEffect((): (() => void | undefined) => {
    if (isLoggedIn) {
      return (): undefined => undefined;
    }

    const onKeydown = (event: NativeKeyboardEvent): void => {
      if (!Number.isNaN(Number(event.key))) {
        onInput(Number(event.key));
      }
    };

    window.addEventListener('keydown', onKeydown);
    return (): void => window.removeEventListener('keydown', onKeydown);
  }, [isLoggedIn, onInput]);

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
      <LoginFormInput pin={pin} onInput={onInput} length={pinLength} />
    </FlexCenter>
  );
};

const mapStateToProps = (state: GlobalState): StateProps => ({
  isLoggedIn: getLoggedIn(state),
});

const mapDispatchToProps: DispatchProps = {
  onLogin: loginRequested,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
