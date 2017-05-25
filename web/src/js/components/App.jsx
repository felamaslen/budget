/**
 * Main App component initates the global dispatcher, sets the app state
 * and renders other components
 */

import { List } from 'immutable';
import React, { Component } from 'react';
import { Dispatcher } from 'flux';

// the global reducer decides what to do for each action
import globalReducer from '../reducers/GlobalReducer';

import { ErrorMessages } from './ErrorMessages';
import { Header } from './Header';
import { LoginForm } from './LoginForm';

// side-effect handlers
import effectHandler from '../effects-handlers/EffectHandler';

// the reduction holds the state of the app
import Reduction from '../reduction';

export default class App extends Component {
  constructor(props) {
    super(props);

    // define a flux model
    const dispatcher = new Dispatcher();

    // top-level store defined here
    dispatcher.register(action => {
      let reduction = this.state.reduction;

      // purge side effects
      reduction = reduction.set('effects', List.of());
      // execute reducers
      reduction = globalReducer(reduction, action);
      reduction.get('effects').forEach(effect => effectHandler(dispatcher, effect));

      // render views with changed properties
      this.setState({ reduction });
    });

    // the state contains the dispatcher and reduction as its main properties
    this.state = {
      dispatcher,
      reduction: new Reduction()
    };
  }

  render() {
    const loggedIn = this.state.reduction.getIn(['appState', 'user', 'uid']) > 0;
    const loading = this.state.reduction.getIn(['appState', 'loading']);

    const errorMessages = (
      <ErrorMessages dispatcher={this.state.dispatcher}
        list={this.state.reduction.getIn(['appState', 'errorMsg'])}
      />
    );
    const header = (
      <Header dispatcher={this.state.dispatcher}
        showNav={loggedIn}
        navPageIndex={this.state.reduction.getIn(['appState', 'currentPage'])} />
    );
    const loginForm = loggedIn || loading ? null : (
      <LoginForm dispatcher={this.state.dispatcher}
        inputStep={this.state.reduction.getIn(['appState', 'loginForm', 'inputStep'])}
        loading={this.state.reduction.getIn(['appState', 'loginFOrm', 'loading'])} />
    );

    const spinner = loading ? (
      <div className="progress-outer">
        <div className="progress-inner">
          <div className="progress"></div>
        </div>
      </div>
    ) : null;

    return (
      <div id="main">
        {errorMessages}
        {header}
        {loginForm}
        {spinner}
      </div>
    );
  }
}

