import { connect } from 'react-redux';
import { LIST_COLS_MOBILE } from '~client/constants/data';
import { aMobileEditDialogOpened } from '~client/actions/form.actions';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import ListRowCellMobile from '~client/components/ListRowCellMobile';
import { rowShape } from '~client/prop-types/page/rows';

function ListRowMobile({ page, row, colKeys, listColsMobile, AfterRowMobile, onEdit }) {
    const onClick = useCallback(() => onEdit(page, row.id), [page, row.id, onEdit]);

    return (
        <li onClick={onClick}>
            {listColsMobile.map((column, index) => (
                <ListRowCellMobile key={column}
                    page={page}
                    colKey={colKeys[index]}
                    row={row}
                    column={column}
                />
            ))}
            {AfterRowMobile && <AfterRowMobile row={row} colKeys={colKeys} />}
        </li>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    colKeys: PropTypes.array.isRequired,
    row: rowShape.isRequired,
    id: PropTypes.string.isRequired,
    listColsMobile: PropTypes.array.isRequired,
    AfterRowMobile: PropTypes.func,
    onEdit: PropTypes.func.isRequired
};

ListRowMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE
};

const mapStateToProps = (state, { page, id }) => ({
    row: state.pages[page].rows.find(({ id: rowId }) => rowId === id)
});

const mapDispatchToProps = {
    onEdit: aMobileEditDialogOpened
};

export default connect(mapStateToProps, mapDispatchToProps)(ListRowMobile);
