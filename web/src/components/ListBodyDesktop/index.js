import { List as list, Map as map, OrderedMap } from 'immutable';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import AddForm from './AddForm';
import ListHeadDesktop from '../ListHeadDesktop';
import ListRowDesktop from '~client/containers/ListRowDesktop';

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

    const listRows = useMemo(() => rows && rowIds.map(id => (
        <ListRowDesktop key={id}
            page={page}
            id={id}
            row={rows.get(id)}
            daily={dailyTotals && dailyTotals.get(id)}
            {...subProps}
        />
    )), [rowIds, dailyTotals, page, rows, subProps]);

    if (!listRows) {
        return null;
    }

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

