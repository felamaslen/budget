import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CellInner from './cell-inner';

export default function OverviewTableCells({ row: { cells, past, active, future }, rowKey, editRow, editCol }) {
    return (
        <div className={classNames('row', { past, active, future })}>
            {cells.map((cell, cellKey) => {
                const { column, rgb, editable } = cell;
                const style = {};
                if (rgb) {
                    style.backgroundColor = `rgb(${rgb.join(',')})`;
                }

                return (
                    <div key={cellKey}
                        className={classNames('col', column[0], {
                            'editable-outer': editable,
                            editing: editable && editRow === rowKey && editCol === 0
                        })}
                        style={style}>
                        <CellInner cell={cell} cellKey={cellKey} rowKey={rowKey} editable={editable} />
                    </div>
                );
            })}
        </div>
    );
}

OverviewTableCells.propTypes = {
    row: PropTypes.shape({
        column: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
        rgb: PropTypes.array,
        editable: PropTypes.bool,
        past: PropTypes.bool,
        active: PropTypes.bool,
        future: PropTypes.bool
    }).isRequired,
    rowKey: PropTypes.number.isRequired,
    editRow: PropTypes.number,
    editCol: PropTypes.number
};
