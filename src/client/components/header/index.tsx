import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import * as Styled from './styles';
import { AppLogo } from '~client/components/app-logo';
import { Navbar } from '~client/components/nav-bar';
import { getApiLoading } from '~client/selectors';

export type Props = {
  loggedIn: boolean;
  onLogout: () => void;
};

export const Header = withRouter<RouteComponentProps & Props, FC<RouteComponentProps & Props>>(
  ({ loggedIn, onLogout }) => {
    const loadingApi = useSelector(getApiLoading);
    return (
      <Styled.Header role="heading">
        <AppLogo loading={loadingApi} />
        {loggedIn && <Navbar onLogout={onLogout} />}
      </Styled.Header>
    );
  },
);
Header.displayName = 'Header';
