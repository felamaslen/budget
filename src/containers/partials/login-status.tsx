import { connect } from 'react-redux';
import React, { SFC } from 'react';
import { GlobalState } from '~/reducers';

interface LoginStatusProps {
  userName?: string;
}

const LoginStatus: SFC<LoginStatusProps> = ({ userName }) => {
  if (userName) {
    return <span>Logged in as {userName}</span>;
  }

  return <span>Logged out</span>;
};

const mapStateToProps = (state: GlobalState): object => ({
  userName: state.login.name,
});

export default connect(mapStateToProps)(LoginStatus);
