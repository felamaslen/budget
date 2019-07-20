import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import HoverCost from '~client/components/HoverCost';

function getStyle(rgb) {
    if (!rgb) {
        return {};
    }

    return { backgroundColor: `rgb(${rgb.join(',')})` };
}

export default function OverviewTableCells({ row: { cells, past, active, future } }) {
    return (
        <div className={classNames('row', { past, active, future })}>
            {cells.map(({ column: [key], value, rgb }, index) => (
                <div
                    key={key}
                    className={classNames('col', key)}
                    style={getStyle(rgb)}
                >
                    <HoverCost value={value} abbreviate={index > 0} />
                </div>
            ))}
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
