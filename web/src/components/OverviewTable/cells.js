import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CellInner from './cell-inner';

export default function OverviewTableCells({ row: { cells, past, active, future } }) {
    return (
        <div className={classNames('row', { past, active, future })}>
            {cells.map((cell, cellKey) => {
                const { column, rgb } = cell;
                const style = {};
                if (rgb) {
                    style.backgroundColor = `rgb(${rgb.join(',')})`;
                }

                return (
                    <div key={cellKey}
                        className={classNames('col', column[0])}
                        style={style}>
                        <CellInner cell={cell} cellKey={cellKey} />
                    </div>
                );
            })}
        </div>
    );
}

OverviewTableCells.propTypes = {
    row: PropTypes.shape({
        cells: PropTypes.arrayOf(PropTypes.shape({
            column: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
            rgb: PropTypes.arrayOf(PropTypes.number)
        }).isRequired).isRequired,
        past: PropTypes.bool,
        active: PropTypes.bool,
        future: PropTypes.bool
    }).isRequired
};
