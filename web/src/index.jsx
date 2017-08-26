/**
 * Main entry point for budget web app
 */

import React from 'react';
import { render } from 'react-dom';
// import App from './components/App';

import './sass/index';

if (process.env.NODE_ENV !== 'test') {
    render(
        // <App />,
        <h1>It works!</h1>,
        document.getElementById('root')
    );
}

