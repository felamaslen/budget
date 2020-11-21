import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import * as Styled from './styles';
import { AppLogo } from '~client/components/app-logo';
import { Navbar } from '~client/components/nav-bar';
import { getLoggedIn, getUnsaved, getApiLoading } from '~client/selectors';

export type Props = {
  onLogout: () => void;
};

const Header: React.FC<RouteComponentProps & Props> = ({ onLogout }) => {
  const loggedIn = useSelector(getLoggedIn);
  const loadingApi = useSelector(getApiLoading);
  const unsavedApi = useSelector(getUnsaved);

  return (
    <Styled.Header role="heading">
      <AppLogo loading={loadingApi} unsaved={unsavedApi} />
      {loggedIn && <Navbar onLogout={onLogout} />}
    </Styled.Header>
  );
};
const RoutedHeader = withRouter(Header);
export { RoutedHeader as Header };
