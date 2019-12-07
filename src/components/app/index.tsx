import React, { SFC } from 'react';
import { Switch, Route } from 'react-router-dom';

import LoginForm from '~/containers/pages/login-form';
import LoginStatus from '~/containers/partials/login-status';

const Food: SFC = () => <span>Food route</span>;
const General: SFC = () => <span>General route</span>;

const App: SFC = () => (
  <div>
    <h1>Hello world</h1>
    <section>
      <LoginStatus />
    </section>
    <LoginForm />
    <Switch>
      <Route path="/food" component={Food} />
      <Route path="/general" component={General} />
    </Switch>
  </div>
);

export default App;
