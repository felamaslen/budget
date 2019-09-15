import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { LIST_COLS_MOBILE } from '~client/constants/data';

const ListHeadMobile = ({ listColsMobile }) => (
    <div className="list-head noselect">
        {listColsMobile.map((column) => (
            <span key={column}
                className={classNames('column', column)}
            >{column}</span>
        ))}
    </div>
);

ListHeadMobile.propTypes = {
    listColsMobile: PropTypes.arrayOf(PropTypes.string.isRequired),
};

ListHeadMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE,
};

export default ListHeadMobile;
