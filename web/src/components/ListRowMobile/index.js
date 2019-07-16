import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { rowShape } from '~client/prop-types/page/rows';
import { formatItem } from '~client/modules/format';
import { LIST_COLS_MOBILE } from '~client/constants/data';

export default function ListRowMobile({ item, listColsMobile, AfterRowMobile }) {
    return (
        <>
            {listColsMobile.map(column => (
                <span key={column} className={classNames('column', column)}>
                    {formatItem(column, item[column])}
                </span>
            ))}
            {AfterRowMobile && <AfterRowMobile item={item} />}
        </>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    item: rowShape.isRequired,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    listColsMobile: PropTypes.array,
    AfterRowMobile: PropTypes.func
};

ListRowMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE
};
