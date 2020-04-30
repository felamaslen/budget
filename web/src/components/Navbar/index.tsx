import React from 'react';

import { PAGES } from '~client/constants/data';
import { Page } from '~client/types/app';

import * as Styled from './styles';

type Props = {
  onLogout: () => void;
};

const Navbar: React.FC<Props> = ({ onLogout }) => (
  <Styled.NavList>
    {(Object.keys(PAGES) as Page[]).map(page => (
      <Styled.Link
        key={page}
        exact
        to={PAGES[page].path ?? `/${page}`}
        activeClassName="active"
        page={page}
      >
        {page}
      </Styled.Link>
    ))}
    <Styled.Link to="/" as="a" page="logout" onClick={onLogout}>
      {'Log out'}
    </Styled.Link>
  </Styled.NavList>
);

export default Navbar;
