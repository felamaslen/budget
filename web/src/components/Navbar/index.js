import React from 'react';
import PropTypes from 'prop-types';

import { PAGES } from '~client/constants/data';

import * as Styled from './styles';

const Navbar = ({ onLogout }) => (
    <Styled.NavList>
        {Object.keys(PAGES).map(page => (
            <Styled.Link
                key={page}
                exact
                to={PAGES[page].path || `/${page}`}
                activeClassName="active"
                page={page}
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
