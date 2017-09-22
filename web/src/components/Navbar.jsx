import { connect } from 'react-redux';

import { aUserLoggedOut, aPageNavigatedTo } from '../actions/AppActions';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { capitalise } from '../misc/format';
import { PAGES } from '../misc/const';

export class Navbar extends Component {
    renderNavListItem(item, key) {
        const active = key === this.props.navPageIndex;

        const classNameLi = classNames({
            'nav-link-li': true,
            [`nav-link-${item}`]: true,
            active
        });

        const classNameA = classNames({
            'nav-link': true,
            active
        });

        const onClick = () => this.props.navigate(key);

        return (
            <li key={key} className={classNameLi}>
                <a className={classNameA} onClick={onClick}>{capitalise(item)}</a>
            </li>
        );
    }
    render() {
        if (!this.props.active) {
            return null;
        }

        const pageLinksList = PAGES.map(
            (item, key) => this.renderNavListItem(item, key)
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

