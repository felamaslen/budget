import { connect } from 'react-redux';

import { aUserLoggedOut, aPageNavigatedTo } from '../../actions/AppActions';

import React from 'react';
import PropTypes from 'prop-types';

import { NavLink } from 'react-router-dom';

import { PAGES, PAGES_PATHS } from '../../misc/const';

export function Navbar({ active }) {
    if (!active) {
        return null;
    }

    const pageLinksList = PAGES.map((item, key) => {
        const path = PAGES_PATHS[key];
        const className = `nav-link nav-link-${item}`;

        return <NavLink key={key} exact to={path}
            activeClassName="active" className={className}>{item}</NavLink>;
    });

    const logoutHandler = () => this.props.logout();

    return <nav className="nav-list noselect">
        {pageLinksList}
        <a className="nav-link nav-link-logout" onClick={logoutHandler}>Log out</a>
    </nav>;
}

Navbar.propTypes = {
    active: PropTypes.bool.isRequired,
    logout: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    active: state.getIn(['user', 'uid']) > 0
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(aUserLoggedOut()),
    navigate: page => dispatch(aPageNavigatedTo(page))
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);

