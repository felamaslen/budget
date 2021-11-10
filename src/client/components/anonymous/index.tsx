import { useEffect } from 'react';

import { LoginForm } from '~client/components/login-form';
import { useLogin } from '~client/hooks';

export type Props = {
  onLogin: (apiKey: string) => void;
};

export const Anonymous: React.FC<Props> = ({ onLogin }) => {
  const { login, loading, loggedIn, apiKey } = useLogin();

  useEffect(() => {
    if (!loading && loggedIn && apiKey) {
      onLogin(apiKey);
    }
  }, [loading, loggedIn, apiKey, onLogin]);

  return <LoginForm onLogin={login} loading={loading} />;
};
