/**
 * Displays bar at the top of the page, including navigation
 */

import React, { Component } from 'react';

import AppLogo from './AppLogo';
import Navbar from './Navbar';

export default class Header extends Component {
    render() {
        return <div className="navbar">
            <div className="inner">
                <AppLogo />
                <Navbar />
            </div>
        </div>
    }
}

