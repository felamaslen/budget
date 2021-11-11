import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import GridLoader from 'react-spinners/GridLoader';

import { NumberInputPad } from './number-input-pad';
import { PinDisplay } from './pin-display';
import * as Styled from './styles';

import { errorOpened } from '~client/actions';
import { LOGIN_INPUT_LENGTH } from '~client/constants/data';
import { ErrorLevel } from '~client/constants/error';
import { colors } from '~client/styled/variables';

export type Props = {
  onLogin?: (pin: number) => void;
  loading: boolean;
};

export const LoginForm: React.FC<Props> = ({ onLogin, loading }) => {
  const dispatch = useDispatch();

  const onWarn = useCallback(
    (message: string) => dispatch(errorOpened(message, ErrorLevel.Warn)),
    [dispatch],
  );

  const [pin, setPin] = useState<number[]>([]);
  const onInput = useCallback(
    (value: number, index?: number): void => {
      if (loading) {
        return;
      }
      setPin((last) => {
        const pinIndex = index ?? last.length;
        return pinIndex > last.length ? last : [...last.slice(0, pinIndex), value];
      });
    },
    [loading],
  );

  const inputStep = pin.length;
  const hasFullPin = pin.length >= LOGIN_INPUT_LENGTH;

  useEffect(() => {
    if (hasFullPin && !loading) {
      const pinAsNumber = pin.reduce(
        (last, value, index) => last + value * 10 ** (pin.length - 1 - index),
        0,
      );
      if (pinAsNumber > 999) {
        onLogin?.(pinAsNumber);
      } else {
        onWarn('Pin must not start with zero');
      }
      setPin([]);
    }
  }, [hasFullPin, loading, onLogin, onWarn, pin]);

  const onFocus = useCallback((index: number) => {
    setPin((last) => last.slice(0, index));
  }, []);

  return (
    <Styled.Form>
      <Styled.FormInner>
        <Styled.TitleContainer>
          <Styled.Title>Enter your PIN:</Styled.Title>
          <Styled.SpinnerSpace>
            {loading && <GridLoader color={colors.white} size={8} />}
          </Styled.SpinnerSpace>
        </Styled.TitleContainer>
        <PinDisplay inputStep={inputStep} onFocus={onFocus} onInput={onInput} />
        <NumberInputPad onInput={onInput} />
      </Styled.FormInner>
    </Styled.Form>
  );
};
