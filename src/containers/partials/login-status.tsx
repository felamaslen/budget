import { connect } from 'react-redux';
import React from 'react';
import { GlobalState } from '~/reducers';

interface LoginStatusProps {
  userName?: string;
}

function LoginStatus({ userName }: LoginStatusProps) {
  if (userName) {
    return <span>Logged in as {userName}</span>;
  }

  return <span>Logged out</span>;
}

const mapStateToProps = (state: GlobalState) => ({
  userName: state.login.name,
});

export default connect(mapStateToProps)(LoginStatus);
