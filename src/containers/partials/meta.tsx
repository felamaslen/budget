import React, { SFC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loggedOut } from '~/actions/login';
import { getLoggedIn } from '~/selectors/login';
import Header from '~/components/header';
import AppLogo from '~/components/app-logo';
import Nav from '~/components/nav';

const Meta: SFC = () => {
  const isLoggedIn = useSelector(getLoggedIn);
  const dispatch = useDispatch();

  const onLogout = useCallback(() => dispatch(loggedOut()), [dispatch]);

  return (
    <Header>
      <AppLogo />
      {isLoggedIn && <Nav onLogout={onLogout} />}
    </Header>
  );
};

export default Meta;
