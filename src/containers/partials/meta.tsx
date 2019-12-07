import React, { SFC } from 'react';
import { connect } from 'react-redux';

import { loggedOut, LoggedOutAction } from '~/actions/login';
import { GlobalState } from '~/reducers';
import { getLoggedIn } from '~/selectors/login';
import Header from '~/components/header';
import AppLogo from '~/components/app-logo';
import Nav from '~/components/nav';

interface StateProps {
  loggedIn: boolean;
}

interface DispatchProps {
  onLogout: () => LoggedOutAction;
}

interface MetaProps extends StateProps, DispatchProps {}

const Meta: SFC<MetaProps> = ({ loggedIn, onLogout }) => (
  <Header>
    <AppLogo />
    {loggedIn && <Nav onLogout={onLogout} />}
  </Header>
);

const mapStateToProps = (state: GlobalState): StateProps => ({
  loggedIn: getLoggedIn(state),
});

const mapDispatchToProps = {
  onLogout: loggedOut,
};

export default connect(mapStateToProps, mapDispatchToProps)(Meta);
