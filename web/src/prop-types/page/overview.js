import PropTypes from 'prop-types';

export const costShape = PropTypes.shape({
    net: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    spending: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
});
