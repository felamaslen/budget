/**
 * Main App component initates the global dispatcher, sets the app state
 * and renders other components
 */

import { Router, Route } from 'react-router-dom';

import React from 'react';
import PropTypes from 'prop-types';

import ErrorMessages from '../../containers/error-messages';
import Spinner from '../../containers/spinner';
import LoginForm from '../../containers/login-form';
import Content from '../../containers/content';

import Header from '../header';

export default function App({ history }) {
    return <Router history={history}>
        <div className="main">
            <ErrorMessages />
            <Route path="*" component={Header} />
            <LoginForm />
            <Route path="*" component={Content} />
            <Spinner />
        </div>
    </Router>;
}

App.propTypes = {
    history: PropTypes.object.isRequired
};

