/* @jsx jsx */
import { Global, jsx } from '@emotion/react';
import loadable from '@loadable/component';
import { useCallback, useState } from 'react';
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
import { Spinner } from '~client/components/spinner';
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
import { Main } from '~client/styled/shared';
import { useLogoutMutation } from '~client/types/gql';

const LoggedIn = hot(
  loadable(() => import(/* webpackPrefetch: true */ '~client/components/logged-in'), {
    fallback: <Spinner />,
  }),
);

export type Props = {
  loggedIn: boolean;
  onLogin?: AnonymousProps['onLogin'];
  onLogout?: () => void;
  offline?: boolean;
};

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
          {children}
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

const App: React.FC<Props> = ({ loggedIn, onLogin = VOID, onLogout = VOID, offline = false }) => (
  <RootContainer loggedIn={loggedIn} onLogout={onLogout}>
    {offline && <Offline />}
    {!offline && (loggedIn ? <LoggedIn /> : <Anonymous onLogin={onLogin} />)}
  </RootContainer>
);

export default App;

export const ClientApp = compose(
  hot,
  withRouter,
)(() => {
  const offline = useOffline();

  const dispatch = useDispatch();
  const [apiKey, onLogin] = useState<string | null>(window.__API_KEY__ ?? null);

  const onLogout = useCallback(() => {
    onLogin(null);
    dispatch(loggedOut());
  }, [dispatch]);

  return (
    <GQLProvider apiKey={apiKey}>
      <App loggedIn={!!apiKey} onLogin={onLogin} onLogout={onLogout} offline={offline} />
    </GQLProvider>
  );
});
