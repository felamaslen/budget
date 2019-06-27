import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

export const costShape = PropTypes.shape({
    net: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    spending: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
});

export const rowDatesShape = PropTypes.arrayOf(PropTypes.instanceOf(DateTime).isRequired);
