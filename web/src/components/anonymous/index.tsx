import React from 'react';

import { LoginForm } from '~client/components/login-form';
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
    return null;
  }

  return <LoginForm onLogin={login} loading={loading} />;
};
