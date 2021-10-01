import React from 'react';

import { ModifyAccount } from './accounts';
import { usePlanningState } from './context';
import * as Styled from './styles';

export const Header = React.forwardRef<HTMLDivElement>((_, ref) => {
  const state = usePlanningState();
  return (
    <Styled.Header ref={ref}>
      <Styled.MonthDateHeader>Date</Styled.MonthDateHeader>
      {state.accounts.map((account) => (
        <ModifyAccount key={account.account} account={account} />
      ))}
    </Styled.Header>
  );
});
Header.displayName = 'Header';
