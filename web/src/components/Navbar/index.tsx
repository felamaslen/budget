import React from 'react';

import * as Styled from './styles';
import { PAGES } from '~client/constants/data';
import { Page } from '~client/types/app';

type Props = {
  onLogout: () => void;
};

const Navbar: React.FC<Props> = ({ onLogout }) => (
  <Styled.NavList>
    {(Object.keys(PAGES) as Page[]).map((page) => (
      <Styled.Link
        key={page}
        exact
        to={PAGES[page].path ?? `/${page}`}
        tabIndex={-1}
        activeClassName="active"
        page={page}
      >
        {page}
      </Styled.Link>
    ))}
    <Styled.Link to="/" as="a" tabIndex={-1} page="logout" onClick={onLogout}>
      Log out
    </Styled.Link>
  </Styled.NavList>
);

export default Navbar;
