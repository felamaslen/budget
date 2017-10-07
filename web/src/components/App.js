/**
 * Main App component initates the global dispatcher, sets the app state
 * and renders other components
 */

import { connect } from 'react-redux';
import { Router, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import { aSettingsLoaded } from '../actions/AppActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ErrorMessages from './ErrorMessages';
import DataSync from './DataSync';
import Spinner from './Spinner';
import Header from './Header';
import LoginForm from './LoginForm';
import Content from './Content';

const history = createHistory();

class App extends Component {
    componentDidMount() {
        this.props.loadSettings();
    }
    render() {
        return <Router history={history}>
            <div id="main">
                <ErrorMessages />
                <DataSync />
                <Route path="*" component={Header} />
                <LoginForm />
                <Route path="*" component={Content} />
                <Spinner />
            </div>
        </Router>;
    }
}

App.propTypes = {
    loadSettings: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    loadSettings: () => dispatch(aSettingsLoaded())
});

export default connect(null, mapDispatchToProps)(App);
