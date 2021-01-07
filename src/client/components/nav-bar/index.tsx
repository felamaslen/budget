import React from 'react';

import * as Styled from './styles';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

type Props = {
  onLogout: () => void;
};

const pages: { page: Styled.NavPage; path?: string }[] = [
  { page: PageNonStandard.Overview, path: '/' },
  { page: PageNonStandard.Analysis },
  { page: PageNonStandard.Funds },
  { page: PageListStandard.Income },
  { page: PageListStandard.Bills },
  { page: PageListStandard.Food },
  { page: PageListStandard.General },
  { page: PageListStandard.Holiday },
  { page: PageListStandard.Social },
];

export const Navbar: React.FC<Props> = ({ onLogout }) => (
  <Styled.NavList>
    {pages.map(({ page, path }) => (
      <Styled.Link
        key={page}
        exact
        to={path ?? `/${page}`}
        tabIndex={-1}
        activeClassName="active"
        page={page}
      >
        {page}
      </Styled.Link>
    ))}
    <Styled.Link
      to="/"
      as="a"
      tabIndex={-1}
      page="logout"
      onClick={onLogout}
      activeClassName="not-active"
    >
      Log out
    </Styled.Link>
  </Styled.NavList>
);
