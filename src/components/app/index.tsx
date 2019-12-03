import React, { useRef, useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import LoginStatus from '~/containers/partials/login-status';

const Food = () => <span>Food route</span>;
const General = () => <span>General route</span>;

export default function App() {
  const [color, setColor] = useState<boolean>(false);
  const timer = useRef<number>();
  useEffect(() => {
    timer.current = window.setInterval(() => setColor(last => !last), 1000);

    return () => clearInterval(timer.current);
  }, []);

  return (
    <div
      style={{
        color: color ? 'orange' : 'hotpink',
      }}
    >
      <h1>Hello world</h1>
      <section>
        <LoginStatus />
      </section>
      <Switch>
        <Route path="/food" component={Food} />
        <Route path="/general" component={General} />
      </Switch>
    </div>
  );
}
