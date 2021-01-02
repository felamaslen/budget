import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as Styled from './styles';
import { errorClosed, errorRemoved } from '~client/actions';
import { ERROR_CLOSE_TIME, ERROR_MESSAGE_DELAY } from '~client/constants/error';
import { useCTA } from '~client/hooks';
import { VOID } from '~client/modules/data';
import { State } from '~client/reducers';
import { Message } from '~client/reducers/error';

const getErrors = (state: State): State['error'] => state.error;

const ErrorMessage: React.FC<Message> = ({ id, closed, message: { text, level } }) => {
  const closeTimer = useRef<number>(0);
  const dispatch = useDispatch();
  const onClose = useCallback((): void => {
    dispatch(errorClosed(id));
    clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      dispatch(errorRemoved(id));
    }, ERROR_CLOSE_TIME);
  }, [dispatch, id]);

  const [focused, setFocused] = useState<boolean>(false);
  const keepFocused = useCallback(() => setFocused(true), []);
  const dropFocus = useCallback(() => setFocused(false), []);
  useEffect(() => {
    clearTimeout(closeTimer.current);
    if (!focused) {
      closeTimer.current = window.setTimeout(onClose, ERROR_MESSAGE_DELAY);
    }
  }, [focused, onClose]);

  const closeEvents = useCTA(closed ? VOID : onClose);

  return (
    <Styled.Message
      role="button"
      onMouseOver={keepFocused}
      onFocus={keepFocused}
      onMouseOut={dropFocus}
      onBlur={dropFocus}
      key={id}
      level={level}
      closed={closed}
      {...closeEvents}
    >
      <span>{text}</span>
    </Styled.Message>
  );
};

export const ErrorMessages: React.FC = () => {
  const errors: Message[] = useSelector(getErrors);

  return (
    <Styled.MessageList>
      {errors.map((error) => (
        <ErrorMessage key={error.id} {...error} />
      ))}
    </Styled.MessageList>
  );
};
