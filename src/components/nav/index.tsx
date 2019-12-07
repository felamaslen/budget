import React, { SFC } from 'react';
import { NavLink } from 'react-router-dom';

import { LoggedOutAction } from '~/actions/login';
import pages from '~/constants/pages';

import * as Styled from './styles';

interface NavProps {
  onLogout: () => LoggedOutAction;
}

const Nav: SFC<NavProps> = ({ onLogout }) => (
  <Styled.NavList>
    {Object.keys(pages).map(page => (
      <Styled.Link
        as={NavLink}
        key={page}
        exact
        to={pages[page].path || `/${page}`}
        activeClassName="active"
        page={page}
      >
        {page}
      </Styled.Link>
    ))}
    <Styled.Link page="logout" onClick={onLogout}>
      Log out
    </Styled.Link>
  </Styled.NavList>
);

export default Nav;
