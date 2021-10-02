import React, { useEffect, useState } from 'react';

import { AddAccount, ModifyAccount } from './accounts';
import { usePlanningState } from './context';
import { Rates, Props as PropsRates } from './rates';
import * as Styled from './styles';

import { useIsMobile } from '~client/hooks';
import { Hamburger, HamburgerButton } from '~client/styled/shared/hamburger';
import type { PlanningAccount } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type Props = Pick<PropsRates, 'year'>;

export const Sidebar: React.FC<Props> = ({ year }) => {
  const state = usePlanningState();
  const isMobile = useIsMobile();

  const [isHidden, setHidden] = useState<boolean>(true);
  const [isHiding, setHiding] = useState<boolean>(true);

  useEffect(() => {
    if (isHiding) {
      const timer = window.setTimeout(() => setHidden(true), 350);
      return (): void => clearTimeout(timer);
    }
    setHidden(false);
    return undefined;
  }, [isHiding]);

  return (
    <Styled.Sidebar isHidden={isHiding && isMobile}>
      {isMobile && (
        <HamburgerButton onClick={(): void => setHiding((last) => !last)}>
          <Hamburger />
        </HamburgerButton>
      )}
      <Styled.SidebarBody isHidden={isHidden && isMobile}>
        <Rates year={year} />
        <AddAccount />
        {state.accounts
          .filter((account): account is GQL<PlanningAccount> => !!account.id)
          .map((account) => (
            <ModifyAccount key={account.id} account={account} />
          ))}
      </Styled.SidebarBody>
    </Styled.Sidebar>
  );
};
