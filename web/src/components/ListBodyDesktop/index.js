import { List as list, Map as map, OrderedMap } from 'immutable';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import AddForm from './AddForm';
import ListHeadDesktop from '../ListHeadDesktop';
import ListRowDesktop from '~client/containers/ListRowDesktop';

export default function ListBodyDesktop({
    page,
    rows,
    rowIds,
    getDaily,
    dailyTotals,
    weeklyValue,
    totalCost,
    addBtnFocus,
    onDesktopAdd,
    AfterRow,
    TotalValue
}) {
    const listRows = useMemo(() => rows && rowIds.map(id => (
        <ListRowDesktop key={id}
            page={page}
            id={id}
            row={rows.get(id)}
            daily={dailyTotals && dailyTotals.get(id)}
            AfterRow={AfterRow}
        />
    )), [rowIds, dailyTotals, page, rows, AfterRow]);

    if (!listRows) {
        return null;
    }

    return (
        <ul className="list-ul">
            <li className="list-head">
                <ListHeadDesktop
                    page={page}
                    weeklyValue={weeklyValue}
                    getDaily={getDaily}
                    totalCost={totalCost}
                    TotalValue={TotalValue}
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
    getDaily: PropTypes.bool,
    dailyTotals: PropTypes.instanceOf(map),
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired,
    AfterRow: PropTypes.func,
    TotalValue: PropTypes.func
};

