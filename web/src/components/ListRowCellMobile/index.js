import React from 'react';
import PropTypes from 'prop-types';
import Editable from '~client/containers/Editable';

import { rowShape } from '~client/prop-types/page/rows';

const ListRowCellMobile = ({ page, colKey, row, column }) => (
    <span className={column}>
        <Editable
            page={page}
            row={row.id}
            col={colKey}
            item={column}
            value={row.cols[colKey]}
            staticEdit
        />
    </span>
);

ListRowCellMobile.propTypes = {
    page: PropTypes.string.isRequired,
    colKey: PropTypes.number.isRequired,
    row: rowShape.isRequired,
    column: PropTypes.string.isRequired
};

export default ListRowCellMobile;
