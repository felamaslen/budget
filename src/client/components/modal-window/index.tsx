import type { History } from 'history';
import React, { useState, useRef, useCallback, useEffect } from 'react';

import * as Styled from './styles';
import { NULL } from '~client/modules/data';

type Props = {
  title: string;
  onClosed?: () => void;
  width?: number;
};

export const ModalWindow: React.FC<Props> = ({ title, onClosed = NULL, width, children }) => {
  const timer = useRef<number>();
  const [visible, setVisible] = useState(false);
  const onClose = useCallback(() => {
    setVisible(false);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(onClosed, 300);
  }, [onClosed]);

  useEffect(() => {
    setVisible(true);
    return (): void => clearTimeout(timer.current);
  }, []);

  return (
    <Styled.ModalWindow visible={visible} width={width}>
      <Styled.Meta>
        <Styled.Title>{title}</Styled.Title>
        <Styled.BackButton onClick={onClose}>&times;</Styled.BackButton>
      </Styled.Meta>
      {children}
    </Styled.ModalWindow>
  );
};

export function useCloseModal(history: History): () => void {
  return useCallback(() => {
    history.replace('/');
  }, [history]);
}
