/* @jsx jsx */
import { Global, jsx } from '@emotion/react';
import { lazy, Suspense, useCallback, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider, useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import BarLoader from 'react-spinners/BarLoader';
import { Store } from 'redux';

import { Action, loggedOut } from '~client/actions';
import { Anonymous } from '~client/components/anonymous';
import { ErrorMessages } from '~client/components/error-messages';
import { GQLProviderAnonymous, GQLProviderLoggedIn } from '~client/components/gql-provider';
import { Header, Props as HeaderProps } from '~client/components/header';
import { Spinner } from '~client/components/spinner';
import { Outer } from '~client/components/spinner/styles';
import {
  persistentLoginKey,
  ResizeContext,
  TodayContext,
  useDebouncedResize,
  useOffline,
  useToday,
} from '~client/hooks';
import { State } from '~client/reducers';
import { reset } from '~client/styled/reset';
import { Main } from '~client/styled/shared';

const LoggedIn = hot(
  lazy(
    () =>
      import(
        /* webpackPrefetch: true, webpackChunkName: "logged-in" */ '~client/components/logged-in'
      ),
  ),
);

type Props = {
  store: Store<State, Action>;
} & RouteComponentProps;

const RootContainer: React.FC<HeaderProps> = ({ children, ...props }) => {
  const windowWidth = useDebouncedResize();
  const today = useToday();

  return (
    <ResizeContext.Provider value={windowWidth}>
      <TodayContext.Provider value={today}>
        <Main>
          <Global styles={reset} />
          <Header {...props} />
          <ErrorMessages />
          {children}
        </Main>
      </TodayContext.Provider>
    </ResizeContext.Provider>
  );
};

const Offline: React.FC = () => (
  <Outer css={{ flexFlow: 'column' }}>
    <h2>Offline</h2>
    <BarLoader />
    <h3>Trying to reconnect...</h3>
  </Outer>
);

const RootProvided: React.FC = () => {
  const dispatch = useDispatch();
  const [apiKey, onLogin] = useState<string | null>(null);

  const onLogout = useCallback(() => {
    onLogin(null);
    dispatch(loggedOut());
    localStorage.removeItem(persistentLoginKey);
  }, [dispatch]);

  const offline = useOffline();
  if (offline) {
    return (
      <RootContainer loggedIn={false} onLogout={onLogout}>
        <Offline />
      </RootContainer>
    );
  }

  if (apiKey) {
    return (
      <RootContainer loggedIn={true} onLogout={onLogout}>
        <GQLProviderLoggedIn apiKey={apiKey}>
          <Suspense fallback={<Spinner />}>
            <LoggedIn />
          </Suspense>
        </GQLProviderLoggedIn>
      </RootContainer>
    );
  }

  return (
    <RootContainer loggedIn={false} onLogout={onLogout}>
      <GQLProviderAnonymous>
        <Anonymous onLogin={onLogin} />
      </GQLProviderAnonymous>
    </RootContainer>
  );
};

const Root: React.FC<Props> = ({ store }) => (
  <Provider store={store}>
    <RootProvided />
  </Provider>
);
const RoutedRoot = hot(withRouter(Root));
export { RoutedRoot as Root };
