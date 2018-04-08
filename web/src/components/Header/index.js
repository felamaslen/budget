import React from 'react';
import PropTypes from 'prop-types';
import AppLogo from '../AppLogo';
import Navbar from '../Navbar';

export default function Header({ navActive, loadingApi, unsavedApi, onLogout }) {
    return <div className="navbar">
        <div className="inner">
            <AppLogo loading={loadingApi} unsaved={unsavedApi} />
            <Navbar pathname={window.location.pathname} active={navActive} onLogout={onLogout} />
        </div>
    </div>;
}

Header.propTypes = {
    navActive: PropTypes.bool.isRequired,
    loadingApi: PropTypes.bool.isRequired,
    unsavedApi: PropTypes.bool.isRequired,
    onLogout: PropTypes.func.isRequired
};

