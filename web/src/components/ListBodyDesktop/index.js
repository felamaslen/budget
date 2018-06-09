import { List as list, OrderedMap } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import AddForm from './AddForm';
import ListHeadDesktop from '../ListHeadDesktop';
import ListRowDesktop from '../../containers/ListRowDesktop';

export default function ListBodyDesktop({ page, rows, rowIds, addBtnFocus, onDesktopAdd, ...props }) {
    if (!rowIds) {
        return null;
    }

    const getRow = rows
        ? id => rows.get(id)
        : () => null;

    const listRows = rowIds.map(id => (
        <ListRowDesktop key={id} page={page} id={id} row={getRow(id)} {...props} />
    ));

    return (
        <ul className="list-ul">
            <li className="list-head">
                <ListHeadDesktop page={page} {...props} />
            </li>
            <AddForm page={page}
                addBtnFocus={addBtnFocus}
                onAdd={onDesktopAdd} />
            {listRows}
        </ul>
    );
}

ListBodyDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    rows: PropTypes.instanceOf(OrderedMap),
    rowIds: PropTypes.instanceOf(list),
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired
};

