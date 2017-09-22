/**
 * Main App component initates the global dispatcher, sets the app state
 * and renders other components
 */

import { connect } from 'react-redux';

import { aSettingsLoaded, aKeyPressed } from '../actions/AppActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ErrorMessages from './ErrorMessages';
import DataSync from './DataSync';
import Spinner from './Spinner';
import Header from './Header';
import LoginForm from './LoginForm';
import Content from './Content';

class App extends Component {
    componentDidMount() {
        this.props.loadSettings();

        window.addEventListener('keydown', evt => {
            if (evt.key === 'Tab') {
                evt.preventDefault();
            }

            this.props.handleKeyPress({
                key: evt.key,
                shift: evt.shiftKey,
                ctrl: evt.ctrlKey
            });
        });
    }
    render() {
        return <div id="main">
            <ErrorMessages />
            <DataSync />
            <Header />
            <LoginForm />
            <Content />
            <Spinner active={this.props.loading} />
        </div>;
    }
}

App.propTypes = {
    loading: PropTypes.bool.isRequired,
    handleKeyPress: PropTypes.func.isRequired,
    loadSettings: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loading: state.getIn(['global', 'loading'])
});

const mapDispatchToProps = dispatch => ({
    handleKeyPress: event => dispatch(aKeyPressed(event)),
    loadSettings: () => dispatch(aSettingsLoaded())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

