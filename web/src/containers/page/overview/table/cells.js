import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CellInner from './cell-inner';

export function OverviewTableCells({ pageIndex, row, rowKey, editRow, editCol }) {
    const cells = row.get('cells')
        .map((cell, cellKey) => {
            const style = {};
            if (cell.get('rgb')) {
                style.backgroundColor = `rgb(${cell.get('rgb').join(',')})`;
            }

            const editable = cell.get('editable');

            const active = editRow === rowKey && editCol === 0;

            const cellClasses = {
                col: true,
                [cell.getIn(['column', 0])]: true,
                'editable-outer': editable,
                editing: editable && active
            };

            return <div key={cellKey} className={classNames(cellClasses)} style={style}>
                <CellInner pageIndex={pageIndex} cell={cell} cellKey={cellKey}
                    rowKey={rowKey} editable={editable} />
            </div>;
        });

    const rowClasses = classNames({
        row: true,
        past: Boolean(row.get('past')),
        active: Boolean(row.get('active')),
        future: Boolean(row.get('future'))
    });

    return <div className={rowClasses}>{cells}</div>;
}

OverviewTableCells.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    row: PropTypes.instanceOf(map).isRequired,
    rowKey: PropTypes.number.isRequired,
    editRow: PropTypes.number,
    editCol: PropTypes.number
};

const mapStateToProps = state => ({
    editRow: state.getIn(['edit', 'row']),
    editCol: state.getIn(['edit', 'col'])
});

export default connect(mapStateToProps)(OverviewTableCells);

