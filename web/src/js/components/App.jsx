/**
 * Main App component initates the global dispatcher, sets the app state
 * and renders other components
 */

import { List } from 'immutable';
import React, { Component } from 'react';
import { Dispatcher } from 'flux';

// the global reducer decides what to do for each action
import globalReducer from '../reducers/GlobalReducer';

import { SurveyForm } from './SurveyForm.jsx';
import { Header } from './Header.jsx';

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

      // log all actions for debugging purposes
      const actionLog = this.state.actionLog.push(action);

      // purge side effects
      reduction = reduction.set('effects', List.of());
      // execute reducers
      reduction = globalReducer(reduction, action);
      reduction.get('effects').forEach(effectHandler.bind(null, dispatcher));

      // render views with changed properties
      this.setState({ reduction, actionLog });
    });

    // the state contains the dispatcher and reduction as its main properties
    this.state = {
      dispatcher,
      reduction: new Reduction(),
      actionLog: List.of() // for debugging
    };
  }

  render() {
    const form = <SurveyForm dispatcher={this.state.dispatcher}
      formStep={this.state.reduction.getIn(['appState', 'formStep'])}
      formValues={this.state.reduction.getIn(['appState', 'formValues'])}
      formLoading={this.state.reduction.getIn(['appState', 'formLoading'])}
      formSubmitted={this.state.reduction.getIn(['appState', 'formSubmitted'])}
      formStatusText={this.state.reduction.getIn(['appState', 'formStatusText'])} />

    return (
      <div id="main">
        <Header />
        <h1>It works!</h1>
        {form}
      </div>
    );
  }
}

