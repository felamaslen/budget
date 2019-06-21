import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { LIST_COLS_MOBILE } from '~client/constants/data';
import { aMobileEditDialogOpened } from '~client/actions/form.actions';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import ListRowCellMobile from '~client/components/ListRowCellMobile';

export function ListRowMobile({ page, id, row, colKeys, listColsMobile, AfterRowMobile, onEdit }) {

    const cells = listColsMobile.map((column, key) => (
        <ListRowCellMobile key={column}
            page={page} colKey={colKeys[key]} row={row} id={id} column={column} />
    ));

    let afterRowMobile = null;
    if (AfterRowMobile) {
        afterRowMobile = <AfterRowMobile row={row} colKeys={colKeys} />;
    }

    const onClick = useCallback(() => onEdit(page, id), [page, id, onEdit]);

    return (
        <li onClick={onClick}>
            {cells}
            {afterRowMobile}
        </li>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    colKeys: PropTypes.array.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    id: PropTypes.string.isRequired,
    listColsMobile: PropTypes.array.isRequired,
    AfterRowMobile: PropTypes.func,
    onEdit: PropTypes.func.isRequired
};

ListRowMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE
};

const mapStateToProps = (state, { page, id }) => ({
    row: state.getIn(['pages', page, 'rows', id])
});

const mapDispatchToProps = {
    onEdit: aMobileEditDialogOpened
};

export default connect(mapStateToProps, mapDispatchToProps)(ListRowMobile);

