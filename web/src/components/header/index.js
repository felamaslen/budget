/**
 * Displays bar at the top of the page, including navigation
 */

import React from 'react';
import PropTypes from 'prop-types';

import AppLogo from '../../containers/app-logo';
import Navbar from '../../containers/nav-bar';

export default function Header({ location }) {
    return <div className="navbar">
        <div className="inner">
            <AppLogo />
            <Navbar pathname={location.pathname} />
        </div>
    </div>
}

Header.propTypes = {
    location: PropTypes.object.isRequired
};

