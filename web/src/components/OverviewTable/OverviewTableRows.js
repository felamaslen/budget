import React from 'react';
import PropTypes from 'prop-types';
import Cells from './cells';

import * as Styled from './styles';

const OverviewTableRows = ({ rows, numToSkip, ...props }) => (
    <Styled.Rows>
        {rows.slice(numToSkip).map(({ key, ...row }) => (
            <Cells key={key} {...props} row={row} />
        ))}
    </Styled.Rows>
);

OverviewTableRows.propTypes = {
    rows: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
        }).isRequired,
    ).isRequired,
    numToSkip: PropTypes.number.isRequired,
};

export default OverviewTableRows;
