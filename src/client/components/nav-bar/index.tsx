import type { ComponentType, FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

import * as Logos from './logos';
import * as Styled from './styles';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

type Props = RouteComponentProps & {
  onLogout: () => void;
};

type PageDefinition = {
  page: Styled.NavPage;
  Logo: ComponentType;
  path?: string;
  paths?: string[];
};
const pages: PageDefinition[] = [
  {
    page: PageNonStandard.Overview,
    Logo: Logos.LogoOverview,
    path: '/',
    paths: ['/', '/net-worth'],
  },
  { page: PageNonStandard.Planning, Logo: Logos.LogoPlanning },
  { page: PageNonStandard.Analysis, Logo: Logos.LogoAnalysis },
  { page: PageNonStandard.Funds, Logo: Logos.LogoFunds },
  { page: PageListStandard.Income, Logo: Logos.LogoIncome },
  { page: PageListStandard.Bills, Logo: Logos.LogoBills },
  { page: PageListStandard.Food, Logo: Logos.LogoFood },
  { page: PageListStandard.General, Logo: Logos.LogoGeneral },
  { page: PageListStandard.Holiday, Logo: Logos.LogoHoliday },
  { page: PageListStandard.Social, Logo: Logos.LogoSocial },
];

function doesPathMatch(
  location: string,
  page: Styled.NavPage,
  paths: string[] | undefined,
): boolean {
  return (
    location.startsWith(`/${page}`) ||
    (paths?.some((path) => path === location || (path.length > 1 && location.startsWith(path))) ??
      false)
  );
}

export const Navbar = withRouter<RouteComponentProps & Props, FC<RouteComponentProps & Props>>(
  ({ location, onLogout }) => (
    <Styled.NavList>
      {pages.map(({ page, Logo, path, paths }) => (
        <Styled.Link
          key={page}
          page={page}
          isActive={doesPathMatch(location.pathname, page, paths)}
        >
          <NavLink to={path ?? `/${page}`} tabIndex={-1}>
            <Logo />
            <Styled.LinkText>{page}</Styled.LinkText>
          </NavLink>
        </Styled.Link>
      ))}
      <Styled.Link isActive={false} page="logout">
        <NavLink to="/" tabIndex={-1} onClick={onLogout}>
          <Logos.LogoLogout />
          <Styled.LinkText>Log out</Styled.LinkText>
        </NavLink>
      </Styled.Link>
    </Styled.NavList>
  ),
);
Navbar.displayName = 'Navbar';
