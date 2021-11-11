import type { ComponentType } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

import * as Logos from './logos';
import * as Styled from './styles';
import { useIsMobile } from '~client/hooks';
import { colors } from '~client/styled/variables';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

type Props = RouteComponentProps & {
  onLogout: () => void;
};

type PageDefinition = {
  page: Styled.NavPage;
  Logo: ComponentType<Logos.Props>;
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

const Navbar: React.FC<Props> = ({ location, onLogout }) => {
  const isMobile = useIsMobile();
  const logoColor = isMobile ? colors.black : colors.white;
  return (
    <Styled.NavList>
      {pages.map(({ page, Logo, path, paths }) => (
        <Styled.Link
          key={page}
          page={page}
          isActive={doesPathMatch(location.pathname, page, paths)}
        >
          <NavLink to={path ?? `/${page}`} tabIndex={-1}>
            <Logo color={logoColor} />
            <Styled.LinkText>{page}</Styled.LinkText>
          </NavLink>
        </Styled.Link>
      ))}
      <Styled.Link isActive={false} page="logout">
        <NavLink to="/" tabIndex={-1} onClick={onLogout}>
          <Logos.LogoLogout color={logoColor} />
          <Styled.LinkText>Log out</Styled.LinkText>
        </NavLink>
      </Styled.Link>
    </Styled.NavList>
  );
};

const NavbarRouted = withRouter(Navbar);
export { NavbarRouted as Navbar };
