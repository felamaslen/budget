import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import AddForm from './AddForm';
import ListHeadDesktop from '../ListHeadDesktop';
import ListRowDesktop from '../../containers/ListRowDesktop';

export default function ListBodyDesktop({ page, rowIds, addBtnFocus, onDesktopAdd, ...props }) {
    if (!rowIds) {
        return null;
    }

    const rows = rowIds.map(id => (
        <ListRowDesktop key={id} page={page} id={id} {...props} />
    ));

    return (
        <ul className="list-ul">
            <li className="list-head">
                <ListHeadDesktop page={page} {...props} />
            </li>
            <AddForm page={page}
                addBtnFocus={addBtnFocus}
                onAdd={onDesktopAdd} />
            {rows}
        </ul>
    );
}

ListBodyDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    rowIds: PropTypes.instanceOf(list),
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired
};

