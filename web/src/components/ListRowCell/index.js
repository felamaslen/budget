import React, { memo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { rowShape } from '~client/prop-types/page/rows';
import Editable from '~client/containers/Editable';

const ListRowCell = memo(({ page, row, colName, colKey, active }) => {
    const spanClasses = classNames(colName, { active });

    const props = {
        page,
        row: row.id,
        col: colKey,
        item: colName,
        value: row.cols[colKey]
    };

    return <span key={colKey} className={spanClasses}>
        <Editable {...props} />
    </span>;
});

ListRowCell.propTypes = {
    page: PropTypes.string.isRequired,
    row: rowShape.isRequired,
    colName: PropTypes.string.isRequired,
    colKey: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired
};

export default ListRowCell;
