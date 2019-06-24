import React from 'react';
import PropTypes from 'prop-types';
import Editable from '~client/containers/Editable';

import { rowShape } from '~client/prop-types/page/row';

export default function ListRowCellMobile({ page, colKey, row, column }) {
    const value = row.getIn(['cols', colKey]);

    const editableProps = {
        page,
        row: row.id,
        col: colKey,
        item: column,
        value,
        staticEdit: true
    };

    return (
        <span key={colKey} className={column}>
            <Editable {...editableProps} />
        </span>
    );
}

ListRowCellMobile.propTypes = {
    page: PropTypes.string.isRequired,
    colKey: PropTypes.number.isRequired,
    row: rowShape.isRequired,
    column: PropTypes.string.isRequired
};
