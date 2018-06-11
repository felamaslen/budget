import { List as list, Map as map, OrderedMap } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import AddForm from './AddForm';
import ListHeadDesktop from '../ListHeadDesktop';
import ListRowDesktop from '../../containers/ListRowDesktop';

export default function ListBodyDesktop(props) {
    const {
        page,
        rows,
        rowIds,
        dailyTotals,
        weeklyValue,
        totalCost,
        addBtnFocus,
        onDesktopAdd,
        ...subProps
    } = props;

    if (!rowIds) {
        return null;
    }

    const getRow = rows
        ? id => rows.get(id)
        : () => null;

    const listRows = rowIds.map(id => (
        <ListRowDesktop key={id}
            page={page}
            id={id}
            row={getRow(id)}
            daily={dailyTotals && dailyTotals.get(id)}
            {...subProps}
        />
    ));

    return (
        <ul className="list-ul">
            <li className="list-head">
                <ListHeadDesktop
                    page={page}
                    weeklyValue={weeklyValue}
                    totalCost={totalCost}
                    {...subProps}
                />
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
    dailyTotals: PropTypes.instanceOf(map),
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired
};

