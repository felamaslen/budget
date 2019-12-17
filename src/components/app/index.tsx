import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';

import StyleReset from '~/styled/reset';
import LoginForm from '~/containers/pages/login-form';
import Meta from '~/containers/partials/meta';
import Overview from '~/containers/pages/overview';

import * as Styled from './styles';

const Food: FunctionComponent = () => <span>Food route</span>;
const General: FunctionComponent = () => <span>General route</span>;

const App: FunctionComponent = () => (
  <Styled.Main>
    <StyleReset />
    <Meta />
    <LoginForm />
    <Switch>
      <Route path="/food" component={Food} />
      <Route path="/general" component={General} />
      <Route path="/" component={Overview} />
    </Switch>
  </Styled.Main>
);

export default App;
