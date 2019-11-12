import React from 'react';
import PropTypes from 'prop-types';
import HoverCost from '~client/components/HoverCost';

import * as Styled from './styles';

const OverviewTableCells = ({ row: { cells, past, active, future } }) => (
    <Styled.Row past={past} active={active} future={future}>
        {cells.map(({ column: [key], value, rgb }, index) => (
            <Styled.Cell
                key={key}
                column={key}
                color={rgb}
                past={past}
                active={active}
                future={future}
            >
                <HoverCost value={value} abbreviate={index > 0} />
            </Styled.Cell>
        ))}
    </Styled.Row>
);

OverviewTableCells.propTypes = {
    row: PropTypes.shape({
        cells: PropTypes.arrayOf(
            PropTypes.shape({
                column: PropTypes.arrayOf(PropTypes.string.isRequired)
                    .isRequired,
                rgb: PropTypes.arrayOf(PropTypes.number),
            }).isRequired,
        ).isRequired,
        past: PropTypes.bool,
        active: PropTypes.bool,
        future: PropTypes.bool,
    }).isRequired,
};

export default OverviewTableCells;
