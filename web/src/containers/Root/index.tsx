import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Store } from 'redux';

import { Action } from '~client/actions';
import Content from '~client/components/Content';
import { ErrorMessages } from '~client/containers/ErrorMessages';
import Header from '~client/containers/Header';
import { LoginForm } from '~client/containers/LoginForm';
import { Spinner } from '~client/containers/Spinner';
import { ResizeContext, useDebouncedResize } from '~client/hooks/resize';
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

  return (
    <ResizeContext.Provider value={windowWidth}>
      <Main>
        <StyleReset />
        <Header />
        <ErrorMessages />
        <LoginForm />
        {loggedIn && !initialLoading && <Content />}
        <Spinner />
      </Main>
    </ResizeContext.Provider>
  );
};

const Root: React.FC<Props> = ({ store }) => (
  <Provider store={store}>
    <RootProvided />
  </Provider>
);

export default withRouter(Root);
