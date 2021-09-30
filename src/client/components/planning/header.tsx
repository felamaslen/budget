import React, { useCallback, useState } from 'react';

import { AddAccount, ModifyAccount } from './accounts';
import { ToggleButton } from './button';
import { usePlanningState } from './context';
import * as Styled from './styles';

export const Header: React.FC = () => {
  const state = usePlanningState();

  const [addingAccount, setAddingAccount] = useState<boolean>(false);
  const onToggleAddAccount = useCallback(() => setAddingAccount((last) => !last), []);

  return (
    <Styled.Header>
      <Styled.HeaderStart />
      <Styled.MonthDateHeader>Date</Styled.MonthDateHeader>
      {state.accounts.map((account) => (
        <ModifyAccount key={account.account} account={account} />
      ))}
      <Styled.Cell>
        <ToggleButton active={addingAccount} onToggle={onToggleAddAccount} />
      </Styled.Cell>
      {addingAccount && <AddAccount />}
    </Styled.Header>
  );
};
