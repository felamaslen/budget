import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aListItemDeleted } from '../../actions/edit.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PAGES } from '../../constants/data';
import ListRowCell from '../../components/ListRowCell';
import DailyText from '../../components/DailyText';

function ListRowDesktop({ page, id, row, activeCol, getDaily, rowClasses = map.of(), AfterRow, onDelete }) {
    const items = PAGES[page].cols.map((colName, colKey) => (
        <ListRowCell key={colKey}
            page={page}
            row={row}
            colName={colName}
            colKey={colKey}
            id={id}
            active={activeCol === colKey}
        />
    ));

    const itemClassName = classNames({
        future: row.get('future'),
        'first-present': row.get('first-present'),
        ...(rowClasses.get(id) || {})
    });

    let afterRow = null;
    if (AfterRow) {
        afterRow = <AfterRow page={page} id={id} row={row} />;
    }

    return (
        <li className={itemClassName}>
            {items}
            <DailyText enabled={getDaily} row={row} />
            {afterRow}
            <span className="delete">
                <a onClick={() => onDelete(page, id)} />
            </span>
        </li>
    );
}

ListRowDesktop.propTypes = {
    page: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    rowClasses: PropTypes.instanceOf(map),
    activeCol: PropTypes.number,
    daily: PropTypes.number,
    getDaily: PropTypes.bool.isRequired,
    AfterRow: PropTypes.func,
    onDelete: PropTypes.func.isRequired
};

const mapStateToProps = (state, { page, id }) => ({
    row: state.getIn(['pages', page, 'rows', id]),
    activeCol: state.getIn(['edit', 'active', 'row']) === id
        ? state.getIn(['edit', 'active', 'col'])
        : null,
    getDaily: Boolean(PAGES[page].daily)
});

const mapDispatchToProps = dispatch => ({
    onDelete: (page, id) => dispatch(aListItemDeleted({ page, id }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListRowDesktop);

