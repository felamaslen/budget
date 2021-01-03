import React from 'react';

import { LoginForm } from '~client/components/login-form';
import { Spinner } from '~client/components/spinner';
import { useLogin } from '~client/hooks';

type Props = {
  onLogin: (apiKey: string) => void;
};

export const Anonymous: React.FC<Props> = ({ onLogin }) => {
  const { login, loading, initialLoading, loggedIn, apiKey } = useLogin();

  React.useEffect(() => {
    if (!loading && loggedIn && apiKey) {
      onLogin(apiKey);
    }
  }, [loading, loggedIn, apiKey, onLogin]);

  if (initialLoading || apiKey) {
    return <Spinner />;
  }

  return <LoginForm onLogin={login} loading={loading} />;
};
