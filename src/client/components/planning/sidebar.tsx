import React, { useEffect, useState } from 'react';

import { AddAccount, ModifyAccount } from './accounts';
import { usePlanningState } from './context';
import { PlanningOverview } from './overview/overview';
import { Rates } from './rates';
import * as Styled from './styles';

import { useIsMobile } from '~client/hooks';
import { Button, Flex } from '~client/styled/shared';
import { Hamburger, HamburgerButton } from '~client/styled/shared/hamburger';
import type { PlanningAccount } from '~client/types/gql';
import type { GQL } from '~shared/types';

export const Sidebar: React.FC = () => {
  const state = usePlanningState();
  const isMobile = useIsMobile();

  const [showEditForms, setShowEditForms] = useState<boolean>(false);
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
        <Flex>
          <HamburgerButton onClick={(): void => setHiding((last) => !last)}>
            <Hamburger />
          </HamburgerButton>
          <Button onClick={(): void => setShowEditForms(false)}>Overview</Button>
          <Button onClick={(): void => setShowEditForms(true)}>Edit</Button>
        </Flex>
      )}
      <Styled.SidebarBody isHidden={isHidden && isMobile}>
        {showEditForms || !isMobile ? (
          <>
            <Rates />
            <AddAccount />
            {state.accounts
              .filter((account): account is GQL<PlanningAccount> => !!account.id)
              .map((account) => (
                <ModifyAccount key={account.id} account={account} />
              ))}
          </>
        ) : (
          <PlanningOverview />
        )}
      </Styled.SidebarBody>
    </Styled.Sidebar>
  );
};
