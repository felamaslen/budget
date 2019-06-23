import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Editable from '~client/containers/Editable';

export default function ListRowCellMobile({ page, colKey, row, id, column }) {
    const value = row.getIn(['cols', colKey]);

    const editableProps = {
        page,
        row: id,
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
    row: ImmutablePropTypes.map.isRequired,
    id: PropTypes.string.isRequired,
    column: PropTypes.string.isRequired
};
