import React, { useState } from 'react';

import * as Styled from './styles';

import { stopEventPropagation } from '~client/hooks';

export const Sidebar: React.FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Styled.Sidebar
      open={open}
      onMouseOver={stopEventPropagation}
      onMouseMove={stopEventPropagation}
    >
      <Styled.SidebarToggle onClick={(): void => setOpen((last) => !last)}>
        <Styled.SidebarToggleHamburger />
      </Styled.SidebarToggle>
      {children}
    </Styled.Sidebar>
  );
};
