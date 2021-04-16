import React, { Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import * as Styled from './styles';
import { AppLogo } from '~client/components/app-logo';
import { Navbar } from '~client/components/nav-bar';
import { getApiLoading } from '~client/selectors';

export type Props = {
  loggedIn: boolean;
  onLogout: () => void;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

const Header: React.FC<RouteComponentProps & Props> = ({ loggedIn, onLogout, setSettingsOpen }) => {
  const loadingApi = useSelector(getApiLoading);

  return (
    <Styled.Header role="heading">
      <AppLogo loading={loadingApi} setSettingsOpen={setSettingsOpen} />
      {loggedIn && <Navbar onLogout={onLogout} />}
    </Styled.Header>
  );
};
const RoutedHeader = withRouter(Header);
export { RoutedHeader as Header };
