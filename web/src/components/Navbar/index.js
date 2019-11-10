import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PAGES } from '~client/constants/data';

import * as Styled from './styles';

const Navbar = ({ onLogout }) => (
    <Styled.NavList className="nav-list">
        {Object.keys(PAGES).map(page => (
            <Styled.Link
                key={page}
                exact
                to={PAGES[page].path || `/${page}`}
                activeClassName="active"
                page={page}
                className={classNames('nav-link', `nav-link-${page}`)}
            >
                {page}
            </Styled.Link>
        ))}
        <Styled.Link as="a" page="logout" onClick={onLogout}>
            {'Log out'}
        </Styled.Link>
    </Styled.NavList>
);

Navbar.propTypes = {
    onLogout: PropTypes.func.isRequired,
};

export default Navbar;
