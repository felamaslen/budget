import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './style.scss';

const Page = ({ page, className, children }) => (
    <div className={classNames('page', className, `page-${page}`)}>
        {children}
    </div>
);

Page.propTypes = {
    page: PropTypes.string.isRequired,
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.objectOf(PropTypes.bool)
    ]),
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node)
    ]).isRequired
};

Page.defaultProps = {
    clasName: {}
};

export default Page;
