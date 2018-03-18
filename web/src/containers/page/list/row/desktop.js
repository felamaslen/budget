import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aListItemDeleted } from '../../../../actions/edit.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ListRowExtra from './extra';
import { PAGES } from '../../../../constants/data';
import { formatCurrency } from '../../../../misc/format';
import Column from './column';

function getDailyText(getDaily, row) {
    if (!getDaily) {
        return null;
    }

    if (!row.has('daily')) {
        return <span className="daily" />;
    }

    return <span className="daily">
        {formatCurrency(row.get('daily'))}
    </span>;
}

function ListRowDesktop({ page, id, row, activeCol, sold, getDaily, onDelete }) {
    const deleteBtn = <span className="delete">
        <a onClick={() => onDelete()} />
    </span>;

    const items = PAGES[page].cols.map(
        (colName, colKey) => <Column key={colKey}
            page={page}
            row={row}
            colName={colName}
            colKey={colKey}
            id={id}
            active={activeCol === colKey}
        />
    );

    const itemClassName = classNames({
        future: row.get('future'),
        'first-present': row.get('first-present'),
        sold
    });

    return <li className={itemClassName}>
        {items}
        {getDailyText(getDaily, row)}
        <ListRowExtra page={page} row={row} id={id} />
        {deleteBtn}
    </li>;
}

ListRowDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    activeCol: PropTypes.number,
    daily: PropTypes.number,
    sold: PropTypes.bool,
    getDaily: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired
};

const transactionsKey = PAGES.funds.cols.indexOf('transactions');

const mapStateToProps = (state, { page, id }) => ({
    row: state.getIn(['pages', page, 'rows', id]),
    activeCol: state.getIn(['edit', 'active', 'row']) === id
        ? state.getIn(['edit', 'active', 'col'])
        : null,
    getDaily: Boolean(PAGES[page].daily),
    sold: page === 'funds' && state
        .getIn(['pages', 'funds', 'rows', id, 'cols', transactionsKey])
        .isSold()
});

const mapDispatchToProps = (dispatch, { page, id }) => ({
    onDelete: () => dispatch(aListItemDeleted({ page, id }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListRowDesktop);

