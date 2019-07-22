import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { loggedOut } from '~client/actions/login';
import { getLoggedIn } from '~client/selectors/app';
import { getUnsaved } from '~client/selectors/api';
import AppLogo from '~client/components/AppLogo';
import Navbar from '~client/components/Navbar';

const Header = ({ loggedIn, loadingApi, unsavedApi, onLogout }) => (
    <header className="navbar">
        <div className="inner">
            <AppLogo loading={loadingApi} unsaved={unsavedApi} />
            {loggedIn && <Navbar onLogout={onLogout} />}
        </div>
    </header>
);

Header.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    loadingApi: PropTypes.bool.isRequired,
    unsavedApi: PropTypes.bool.isRequired,
    onLogout: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loggedIn: getLoggedIn(state),
    loadingApi: state.api.loading,
    unsavedApi: getUnsaved(state)
});

const mapDispatchToProps = {
    onLogout: loggedOut
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
