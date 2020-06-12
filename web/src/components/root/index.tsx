import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Store } from 'redux';

import { Action } from '~client/actions';
import Content from '~client/components/content';
import { ErrorMessages } from '~client/components/error-messages';
import { Header } from '~client/components/header';
import { LoginForm } from '~client/components/login-form';
import { Spinner } from '~client/components/spinner';
import { ResizeContext, useDebouncedResize, TodayContext, useToday } from '~client/hooks';
import { State } from '~client/reducers';
import { getInitialLoading, getLoggedIn } from '~client/selectors';
import StyleReset from '~client/styled/reset';
import { Main } from '~client/styled/shared';

type Props = {
  store: Store<State, Action>;
} & RouteComponentProps;

const RootProvided: React.FC = () => {
  const loggedIn = useSelector(getLoggedIn);
  const initialLoading = useSelector(getInitialLoading);

  const windowWidth = useDebouncedResize();
  const today = useToday();

  return (
    <ResizeContext.Provider value={windowWidth}>
      <TodayContext.Provider value={today}>
        <Main>
          <StyleReset />
          <Header />
          <ErrorMessages />
          <LoginForm />
          {loggedIn && !initialLoading && <Content />}
          <Spinner />
        </Main>
      </TodayContext.Provider>
    </ResizeContext.Provider>
  );
};

const Root: React.FC<Props> = ({ store }) => (
  <Provider store={store}>
    <RootProvided />
  </Provider>
);
const RoutedRoot = withRouter(Root);
export { RoutedRoot as Root };