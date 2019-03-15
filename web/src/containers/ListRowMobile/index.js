import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { LIST_COLS_MOBILE } from '~client/constants/data';
import { aMobileEditDialogOpened } from '~client/actions/form.actions';
import React from 'react';
import PropTypes from 'prop-types';
import ListRowCellMobile from '~client/components/ListRowCellMobile';

export function ListRowMobile({ page, id, row, colKeys, listColsMobile, AfterRowMobile, onEdit }) {
    const cells = (listColsMobile || LIST_COLS_MOBILE).map((column, key) => (
        <ListRowCellMobile key={column}
            page={page} colKey={colKeys[key]} row={row} id={id} column={column} />
    ));

    let afterRowMobile = null;
    if (AfterRowMobile) {
        afterRowMobile = <AfterRowMobile row={row} colKeys={colKeys} />;
    }

    return (
        <li onClick={onEdit(page, id)}>
            {cells}
            {afterRowMobile}
        </li>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    colKeys: PropTypes.array.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    id: PropTypes.number.isRequired,
    listColsMobile: PropTypes.array,
    AfterRowMobile: PropTypes.func,
    onEdit: PropTypes.func.isRequired
};

const mapStateToProps = (state, { page, id }) => ({
    row: state.getIn(['pages', page, 'rows', id])
});

const mapDispatchToProps = dispatch => ({
    onEdit: (page, id) => () => dispatch(aMobileEditDialogOpened(page, id))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListRowMobile);

