import React from 'react';
import PropTypes from 'prop-types';
import AppLogo from '~client/components/AppLogo';
import Navbar from '~client/components/Navbar';

const Header = ({ loggedIn, loadingApi, unsavedApi, onLogout }) => (
    <div className="navbar">
        <div className="inner">
            <AppLogo loading={loadingApi} unsaved={unsavedApi} />
            {loggedIn && <Navbar onLogout={onLogout} />}
        </div>
    </div>
);

Header.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    loadingApi: PropTypes.bool.isRequired,
    unsavedApi: PropTypes.bool.isRequired,
    onLogout: PropTypes.func.isRequired
};

export default Header;
