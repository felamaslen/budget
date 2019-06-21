import React from 'react';
import PropTypes from 'prop-types';
import AppLogo from '../AppLogo';
import Navbar from '../Navbar';

export default function Header({ loggedIn, loadingApi, unsavedApi, onPageSet, onLogout }) {
    return <div className="navbar">
        <div className="inner">
            <AppLogo loading={loadingApi} unsaved={unsavedApi} />
            <Navbar pathname={window.location.pathname} active={loggedIn}
                onLogout={onLogout} onPageSet={onPageSet} />
        </div>
    </div>;
}

Header.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    loadingApi: PropTypes.bool.isRequired,
    unsavedApi: PropTypes.bool.isRequired,
    onPageSet: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired
};
