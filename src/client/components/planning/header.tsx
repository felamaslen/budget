import React from 'react';

import { usePlanningState } from './context';
import * as Styled from './styles';

export const Header = React.forwardRef<HTMLDivElement>((_, ref) => {
  const state = usePlanningState();
  return (
    <Styled.Header ref={ref}>
      <Styled.MonthDateHeader>Date</Styled.MonthDateHeader>
      {state.accounts.map(({ account }) => (
        <Styled.AccountGroupHeader key={account}>{account}</Styled.AccountGroupHeader>
      ))}
    </Styled.Header>
  );
});
Header.displayName = 'Header';
