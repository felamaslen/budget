import loadable from '@loadable/component';
import { useCallback, useEffect, useRef, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import BarLoader from 'react-spinners/BarLoader';
import { compose } from 'redux';

import { loggedOut } from '~client/actions';
import { Anonymous, Props as AnonymousProps } from '~client/components/anonymous';
import { Config } from '~client/components/config';
import { ErrorMessages } from '~client/components/error-messages';
import { GQLProvider } from '~client/components/gql-provider';
import { Header, Props as HeaderProps } from '~client/components/header';
import type { ContentProps } from '~client/components/logged-in';
import { Spinner, SpinnerInit, SpinnerContext } from '~client/components/spinner';
import { Outer } from '~client/components/spinner/styles';
import { ResizeContext, TodayProvider, useDebouncedResize, useOffline } from '~client/hooks';
import { useWindowFocus } from '~client/hooks/focus';
import { VOID } from '~client/modules/data';
import { GlobalStylesProvider } from '~client/styled/global';
import { H2, H3, PageWrapper } from '~client/styled/shared';
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

export const RootContainer: React.FC<Omit<HeaderProps, 'setSettingsOpen'>> = ({
  onLogout,
  children,
  ...props
}) => {
  const windowWidth = useDebouncedResize();

  const [, logoutFromServer] = useLogoutMutation();
  const logout = useCallback(() => {
    logoutFromServer();
    onLogout();
  }, [onLogout, logoutFromServer]);

  return (
    <ResizeContext.Provider value={windowWidth}>
      <TodayProvider>
        <GlobalStylesProvider>
          <Header {...props} onLogout={logout} />
          <ErrorMessages />
          <PageWrapper>
            {children}
            <Config />
          </PageWrapper>
        </GlobalStylesProvider>
      </TodayProvider>
    </ResizeContext.Provider>
  );
};

const Offline: React.FC = () => (
  <Outer>
    <H2>Offline</H2>
    <BarLoader />
    <H3>Trying to reconnect...</H3>
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

const ClientAppReloader: React.FC = () => {
  const [offline, wasOffline] = useOffline();
  const [connectionAttempt, setConnectionAttempt] = useState<number>(0);
  useEffect(() => {
    if (wasOffline && !offline) {
      setConnectionAttempt((last) => last + 1);
    }
  }, [wasOffline, offline]);

  const dispatch = useDispatch();
  const [apiKey, onLogin] = useState<string | null>(window.__API_KEY__ ?? null);

  const onLogout = useCallback(() => {
    onLogin(null);
    dispatch(loggedOut());
  }, [dispatch]);

  return (
    <GQLProvider apiKey={apiKey} setConnectionAttempt={setConnectionAttempt}>
      <App
        loggedIn={!!apiKey}
        onLogin={onLogin}
        onLogout={onLogout}
        offline={offline}
        connectionAttempt={connectionAttempt}
      />
    </GQLProvider>
  );
};

const maxTimeUnfocusedBeforeReloadMs = 1000 * 60 * 60 * 2;

export const ClientApp = compose(
  hot,
  withRouter,
)(() => {
  const [shouldReload, setShouldReload] = useState<boolean>(false);
  const reloadTimer = useRef<number>(0);

  const onFocus = useCallback((timeSinceLastFocusedMs: number): void => {
    if (timeSinceLastFocusedMs > maxTimeUnfocusedBeforeReloadMs) {
      setShouldReload(true);
    }
  }, []);

  useWindowFocus(onFocus);

  useEffect(() => {
    if (shouldReload) {
      reloadTimer.current = window.setTimeout(() => {
        setShouldReload(false);
      }, 100);
    }
  }, [shouldReload]);

  return shouldReload ? <SpinnerInit /> : <ClientAppReloader />;
});
