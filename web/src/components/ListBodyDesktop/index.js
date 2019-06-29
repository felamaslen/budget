import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { rowsShape, dailyTotalsShape } from '~client/prop-types/page/rows';
import AddForm from '~client/components/ListBodyDesktop/AddForm';
import ListHeadDesktop from '~client/components/ListHeadDesktop';
import ListRowDesktop from '~client/containers/ListRowDesktop';

export default function ListBodyDesktop({
    page,
    rows,
    getDaily,
    dailyTotals,
    weeklyValue,
    totalCost,
    addBtnFocus,
    onDesktopAdd,
    AfterRow,
    TotalValue
}) {
    const listRows = useMemo(() => rows && rows.map(row => (
        <ListRowDesktop key={row.id}
            page={page}
            row={row}
            daily={dailyTotals[row.id]}
            AfterRow={AfterRow}
        />
    )), [dailyTotals, page, rows, AfterRow]);

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
                onAdd={onDesktopAdd}
            />
            {listRows}
        </ul>
    );
}

ListBodyDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    rows: rowsShape,
    getDaily: PropTypes.bool,
    dailyTotals: dailyTotalsShape,
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    addBtnFocus: PropTypes.bool.isRequired,
    onDesktopAdd: PropTypes.func.isRequired,
    AfterRow: PropTypes.func,
    TotalValue: PropTypes.func
};

ListBodyDesktop.defaultProps = {
    dailyTotals: {}
};
