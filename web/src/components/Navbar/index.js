import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import { PAGES } from '~client/constants/data';

import './style.scss';

const Navbar = ({ onLogout }) => (
    <nav className="nav-list noselect">
        {Object.keys(PAGES).map(page => (
            <NavLink key={page}
                exact
                to={PAGES[page].path || `/${page}`}
                activeClassName="active"
                className={classNames('nav-link', `nav-link-${page}`)}>
                {page}
            </NavLink>
        ))}
        <a className="nav-link nav-link-logout" onClick={onLogout}>{'Log out'}</a>
    </nav>
);

Navbar.propTypes = {
    onLogout: PropTypes.func.isRequired
};

export default Navbar;
