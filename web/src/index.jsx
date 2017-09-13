/**
 * Main entry point for budget web app
 */

import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

// import styles and favicon
import './sass/index.scss';
import './images/favicon.png';

if (process.env.NODE_ENV !== 'test') {
    render(
        <App />,
        document.getElementById('root')
    );
}

