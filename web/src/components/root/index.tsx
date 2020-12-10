import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Store } from 'redux';

import { Action, loggedOut } from '~client/actions';
import { Anonymous } from '~client/components/anonymous';
import { ErrorMessages } from '~client/components/error-messages';
import { GQLProviderAnonymous, GQLProviderLoggedIn } from '~client/components/gql-provider';
import { Header, Props as HeaderProps } from '~client/components/header';
import { LoggedIn } from '~client/components/logged-in';
import {
  persistentLoginKey,
  ResizeContext,
  TodayContext,
  useDebouncedResize,
  useToday,
} from '~client/hooks';
import { State } from '~client/reducers';
import StyleReset from '~client/styled/reset';
import { Main } from '~client/styled/shared';

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
          <StyleReset />
          <Header {...props} />
          <ErrorMessages />
          {children}
        </Main>
      </TodayContext.Provider>
    </ResizeContext.Provider>
  );
};

const RootProvided: React.FC = () => {
  const dispatch = useDispatch();
  const [apiKey, onLogin] = React.useState<string | null>(null);

  const onLogout = React.useCallback(() => {
    onLogin(null);
    dispatch(loggedOut());
    localStorage.removeItem(persistentLoginKey);
  }, [dispatch]);

  if (apiKey) {
    return (
      <RootContainer loggedIn={true} onLogout={onLogout}>
        <GQLProviderLoggedIn apiKey={apiKey}>
          <LoggedIn />
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
const RoutedRoot = withRouter(Root);
export { RoutedRoot as Root };
