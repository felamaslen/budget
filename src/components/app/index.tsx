import React, { SFC } from 'react';
import { Switch, Route } from 'react-router-dom';

import StyleReset from '~/styled/reset';
import LoginForm from '~/containers/pages/login-form';
import Meta from '~/containers/partials/meta';

import * as Styled from './styles';

const Food: SFC = () => <span>Food route</span>;
const General: SFC = () => <span>General route</span>;

const App: SFC = () => (
  <Styled.Main>
    <StyleReset />
    <Meta />
    <LoginForm />
    <Switch>
      <Route path="/food" component={Food} />
      <Route path="/general" component={General} />
    </Switch>
  </Styled.Main>
);

export default App;
