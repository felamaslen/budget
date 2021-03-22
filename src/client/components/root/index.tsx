/* @jsx jsx */
import { Global, jsx } from '@emotion/react';
import loadable from '@loadable/component';
import { useCallback, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import BarLoader from 'react-spinners/BarLoader';
import { compose } from 'redux';

import { loggedOut } from '~client/actions';
import { Anonymous, Props as AnonymousProps } from '~client/components/anonymous';
import { ErrorMessages } from '~client/components/error-messages';
import { GQLProvider } from '~client/components/gql-provider';
import { Header, Props as HeaderProps } from '~client/components/header';
import type { ContentProps } from '~client/components/logged-in';
import { Spinner, SpinnerInit, SpinnerContext } from '~client/components/spinner';
import { Outer } from '~client/components/spinner/styles';
import {
  ResizeContext,
  TodayContext,
  useDebouncedResize,
  useOffline,
  useToday,
} from '~client/hooks';
import { VOID } from '~client/modules/data';
import { reset } from '~client/styled/reset';
import { Main, PageWrapper } from '~client/styled/shared';
import { useLogoutMutation } from '~client/types/gql';

const LoggedIn = hot(
  loadable(() => import(/* webpackPrefetch: true */ '~client/components/logged-in'), {
    fallback: <SpinnerInit />,
  }),
);

export type Props = {
  loggedIn: boolean;
  onLogin?: AnonymousProps['onLogin'];
  onLogout?: () => void;
  offline?: boolean;
} & ContentProps;

const RootContainer: React.FC<HeaderProps> = ({ onLogout, children, ...props }) => {
  const windowWidth = useDebouncedResize();
  const today = useToday();

  const [, logoutFromServer] = useLogoutMutation();
  const logout = useCallback(() => {
    logoutFromServer();
    onLogout();
  }, [onLogout, logoutFromServer]);

  return (
    <ResizeContext.Provider value={windowWidth}>
      <TodayContext.Provider value={today}>
        <Main>
          <Global styles={reset} />
          <Header {...props} onLogout={logout} />
          <ErrorMessages />
          <PageWrapper>{children}</PageWrapper>
        </Main>
      </TodayContext.Provider>
    </ResizeContext.Provider>
  );
};

const Offline: React.FC = () => (
  <Outer>
    <h2>Offline</h2>
    <BarLoader />
    <h3>Trying to reconnect...</h3>
  </Outer>
);

const App: React.FC<Props> = ({
  loggedIn,
  onLogin = VOID,
  onLogout = VOID,
  offline = false,
  connectionAttempt,
}) => {
  const [spinner, setSpinner] = useState<number>(0);
  return (
    <RootContainer loggedIn={loggedIn} onLogout={onLogout}>
      {offline && <Offline />}
      {spinner > 0 && <Spinner />}
      <SpinnerContext.Provider value={setSpinner}>
        {!offline &&
          (loggedIn ? (
            <LoggedIn connectionAttempt={connectionAttempt} />
          ) : (
            <Anonymous onLogin={onLogin} />
          ))}
      </SpinnerContext.Provider>
    </RootContainer>
  );
};

export default App;

export const ClientApp = compose(
  hot,
  withRouter,
)(() => {
  const [offline, wasOffline] = useOffline();
  const [connectionAttempt, setConnectionAttempt] = useState<number>(0);
  const onReconnect = useCallback((): void => setConnectionAttempt((last) => last + 1), []);
  useEffect(() => {
    if (wasOffline && !offline) {
      onReconnect();
    }
  }, [wasOffline, offline, onReconnect]);

  const dispatch = useDispatch();
  const [apiKey, onLogin] = useState<string | null>(window.__API_KEY__ ?? null);

  const onLogout = useCallback(() => {
    onLogin(null);
    dispatch(loggedOut());
  }, [dispatch]);

  return (
    <GQLProvider apiKey={apiKey} onReconnected={onReconnect}>
      <App
        loggedIn={!!apiKey}
        onLogin={onLogin}
        onLogout={onLogout}
        offline={offline}
        connectionAttempt={connectionAttempt}
      />
    </GQLProvider>
  );
});
