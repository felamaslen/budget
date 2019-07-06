import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './style.scss';

const Page = ({ page, children }) => (
    <div className={classNames('page', `page-${page}`)}>
        {children}
    </div>
);

Page.propTypes = {
    page: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node)
    ]).isRequired
};

export default Page;
