import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import * as Styled from './styles';
import { loggedOut } from '~client/actions';
import AppLogo from '~client/components/AppLogo';
import Navbar from '~client/components/Navbar';
import { getLoggedIn, getUnsaved, getApiLoading } from '~client/selectors';

const Header: React.FC<RouteComponentProps> = () => {
  const dispatch = useDispatch();

  const loggedIn = useSelector(getLoggedIn);
  const loadingApi = useSelector(getApiLoading);
  const unsavedApi = useSelector(getUnsaved);

  const onLogout = useCallback((): void => {
    dispatch(loggedOut());
  }, [dispatch]);

  return (
    <Styled.Header role="heading">
      <AppLogo loading={loadingApi} unsaved={unsavedApi} />
      {loggedIn && <Navbar onLogout={onLogout} />}
    </Styled.Header>
  );
};

export default withRouter(Header);
