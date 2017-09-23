import { connect } from 'react-redux';

import { aUserLoggedOut, aPageNavigatedTo } from '../actions/AppActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { NavLink } from 'react-router-dom';

import { PAGES, PAGES_PATHS } from '../misc/const';

export class Navbar extends Component {
    renderNavLink(item, key) {
        const path = PAGES_PATHS[key];

        const listItemClass = `nav-link-li nav-link-${item}`;

        return <li key={key} className={listItemClass}>
            <NavLink to={path} activeClassName="active">{item}</NavLink>
        </li>;
    }
    render() {
        if (!this.props.active) {
            return null;
        }

        const pageLinksList = PAGES.map(
            (item, key) => this.renderNavLink(item, key)
        );

        const logoutHandler = () => this.props.logout();

        return <ul className="nav-list noselect">
            {pageLinksList}
            <li className="nav-link-li nav-link-logout">
                <a className="nav-link" onClick={logoutHandler}>Log out</a>
            </li>
        </ul>;
    }
}

Navbar.propTypes = {
    active: PropTypes.bool.isRequired,
    navPageIndex: PropTypes.number.isRequired,
    logout: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    active: state.getIn(['global', 'user', 'uid']) > 0,
    navPageIndex: state.getIn(['global', 'currentPageIndex'])
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(aUserLoggedOut()),
    navigate: page => dispatch(aPageNavigatedTo(page))
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);

