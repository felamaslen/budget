import { connect } from 'react-redux';
import { aUserLoggedOut } from '../../actions/app.actions';
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { PAGES } from '../../constants/data';

export function Navbar({ active, onLogout }) {
    if (!active) {
        return null;
    }

    const pageLinksList = Object.keys(PAGES).map(page => {
        const path = PAGES[page].path || `/${page}`;

        const className = `nav-link nav-link-${page}`;

        return <NavLink key={page} exact to={path}
            activeClassName="active" className={className}>{page}</NavLink>;
    });

    return <nav className="nav-list noselect">
        {pageLinksList}
        <a className="nav-link nav-link-logout" onClick={() => onLogout()}>{'Log out'}</a>
    </nav>;
}

Navbar.propTypes = {
    active: PropTypes.bool.isRequired,
    onLogout: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    active: state.getIn(['user', 'uid']) > 0
});

const mapDispatchToProps = dispatch => ({
    onLogout: () => dispatch(aUserLoggedOut())
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);

