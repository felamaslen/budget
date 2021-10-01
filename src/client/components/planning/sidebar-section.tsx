import React, { useCallback, useState } from 'react';

import * as Styled from './styles';
import { useCTA } from '~client/hooks';

export type Props = {
  title: string;
  initialOpen?: boolean;
};

export const SidebarSection: React.FC<Props> = ({ initialOpen = false, title, children }) => {
  const [isToggled, setToggled] = useState<boolean>(initialOpen);
  const toggleOpen = useCallback(() => setToggled((last) => !last), []);
  const toggleEvents = useCTA(toggleOpen);
  return (
    <>
      <Styled.SidebarTitle {...toggleEvents}>
        <Styled.SidebarToggleStatus>
          {isToggled ? <>[&minus;]</> : '[+]'}
        </Styled.SidebarToggleStatus>
        {title}
      </Styled.SidebarTitle>
      {isToggled && <Styled.SidebarSection>{children}</Styled.SidebarSection>}
    </>
  );
};
