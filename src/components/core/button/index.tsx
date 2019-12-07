import React, { SFC, ReactNode } from 'react';

import useAnchor, { Action } from '~/hooks/anchor';
import * as Styled from './styles';

interface ButtonProps {
  action: Action<HTMLButtonElement>;
  children?: ReactNode | ReactNode[];
}

const Button: SFC<ButtonProps> = ({ action, children, ...props }) => {
  const eventHandlers = useAnchor<HTMLButtonElement>(action);

  return (
    <Styled.Button {...props} {...eventHandlers}>
      {children}
    </Styled.Button>
  );
};

export default Button;
