import React from 'react';
import { Switch, Route } from 'react-router-dom';

import LoginForm from '~/containers/pages/login-form';
import LoginStatus from '~/containers/partials/login-status';

const Food = () => <span>Food route</span>;
const General = () => <span>General route</span>;

export default function App() {
  return (
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
}
