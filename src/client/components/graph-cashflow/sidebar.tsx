import { useState } from 'react';

import * as Styled from './styles';

import { stopEventPropagation } from '~client/hooks';
import { Hamburger } from '~client/styled/shared/hamburger';
import { SettingsBackground } from '~client/styled/shared/settings';

export const Sidebar: React.FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      {open && <SettingsBackground onClick={(): void => setOpen(false)} />}
      <Styled.SidebarToggle open={open} onClick={(): void => setOpen((last) => !last)}>
        <Hamburger />
      </Styled.SidebarToggle>
      <Styled.Sidebar
        open={open}
        onMouseOver={stopEventPropagation}
        onMouseMove={stopEventPropagation}
      >
        {children}
      </Styled.Sidebar>
    </>
  );
};
