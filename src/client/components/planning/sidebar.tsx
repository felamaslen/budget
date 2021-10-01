import React from 'react';

import { AddAccount, ModifyAccount } from './accounts';
import { usePlanningState } from './context';
import { Rates, Props as PropsRates } from './rates';
import * as Styled from './styles';

import type { PlanningAccount } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type Props = Pick<PropsRates, 'year'>;

export const Sidebar: React.FC<Props> = ({ year }) => {
  const state = usePlanningState();
  return (
    <Styled.Sidebar>
      <Rates year={year} />
      <AddAccount />
      {state.accounts
        .filter((account): account is GQL<PlanningAccount> => !!account.id)
        .map((account) => (
          <ModifyAccount key={account.id} account={account} />
        ))}
    </Styled.Sidebar>
  );
};
