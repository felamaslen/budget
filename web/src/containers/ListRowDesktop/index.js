import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aListItemDeleted } from '../../actions/edit.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PAGES } from '../../constants/data';
import { getPageRow } from '../../selectors/list';
import ListRowCell from '../../components/ListRowCell';
import DailyText from '../../components/DailyText';

function ListRowDesktop({ page, id, row, activeCol, getDaily, AfterRow, onDelete }) {
    const rowClass = row.get('className') || '';

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

    const itemClassName = classNames(rowClass, {
        future: row.get('future'),
        'first-present': row.get('first-present')
    });

    let afterRow = null;
    if (AfterRow) {
        afterRow = <AfterRow page={page} id={id} row={row} {...rowClass} />;
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
    activeCol: PropTypes.number,
    daily: PropTypes.number,
    getDaily: PropTypes.bool.isRequired,
    AfterRow: PropTypes.func,
    onDelete: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
    row: getPageRow(state, props),
    activeCol: state.getIn(['edit', 'active', 'row']) === props.id
        ? state.getIn(['edit', 'active', 'col'])
        : null,
    getDaily: Boolean(PAGES[props.page].daily)
});

const mapDispatchToProps = dispatch => ({
    onDelete: (page, id) => dispatch(aListItemDeleted({ page, id }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListRowDesktop);

