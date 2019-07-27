import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { rowShape } from '~client/prop-types/page/rows';
import { formatItem } from '~client/modules/format';
import { LIST_COLS_MOBILE } from '~client/constants/data';

function ListRowMobile({ style, item, listColsMobile, AfterRowMobile, setActive }) {
    const onActivate = useCallback(() => setActive(item.id), [item.id, setActive]);

    return (
        <div
            className={classNames('list-row-mobile', item.className || {})}
            style={style}
            onClick={onActivate}
        >
            {listColsMobile.map(column => (
                <span key={column} className={classNames('column', column)}>
                    {formatItem(column, item[column])}
                </span>
            ))}
            {AfterRowMobile && <AfterRowMobile item={item} />}
        </div>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    style: PropTypes.object,
    item: rowShape.isRequired,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    listColsMobile: PropTypes.array,
    AfterRowMobile: PropTypes.func
};

ListRowMobile.defaultProps = {
    style: {},
    listColsMobile: LIST_COLS_MOBILE
};

export default memo(ListRowMobile);
