import { RouteComponentProps, withRouter } from 'react-router';

import { NavLink } from 'react-router-dom';
import * as Styled from './styles';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

type Props = RouteComponentProps & {
  onLogout: () => void;
};

const pages: { page: Styled.NavPage; path?: string; paths?: string[] }[] = [
  { page: PageNonStandard.Overview, path: '/', paths: ['/', '/net-worth'] },
  { page: PageNonStandard.Planning },
  { page: PageNonStandard.Analysis },
  { page: PageNonStandard.Funds },
  { page: PageListStandard.Income },
  { page: PageListStandard.Bills },
  { page: PageListStandard.Food },
  { page: PageListStandard.General },
  { page: PageListStandard.Holiday },
  { page: PageListStandard.Social },
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

const Navbar: React.FC<Props> = ({ location, onLogout }) => (
  <Styled.NavList>
    {pages.map(({ page, path, paths }) => (
      <Styled.Link key={page} page={page} isActive={doesPathMatch(location.pathname, page, paths)}>
        <NavLink to={path ?? `/${page}`} tabIndex={-1}>
          <Styled.LinkText>{page}</Styled.LinkText>
        </NavLink>
      </Styled.Link>
    ))}
    <Styled.Link isActive={false} page="logout">
      <NavLink to="/" tabIndex={-1} onClick={onLogout}>
        <Styled.LinkText>Log out</Styled.LinkText>
      </NavLink>
    </Styled.Link>
  </Styled.NavList>
);

const NavbarRouted = withRouter(Navbar);
export { NavbarRouted as Navbar };
