/**
 * Main App component initates the global dispatcher, sets the app state
 * and renders other components
 */

import { Router, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import React from 'react';

import ErrorMessages from '../../containers/error-messages';
import DataSync from '../../containers/data-sync';
import Spinner from '../../containers/spinner';
import LoginForm from '../../containers/login-form';
import Content from '../../containers/content';

import Header from '../header';

const history = createHistory();

export default function App() {
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

