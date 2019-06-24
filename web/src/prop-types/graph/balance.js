import PropTypes from 'prop-types';

export const targetsShape = PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.number.isRequired,
    from: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    months: PropTypes.number.isRequired,
    last: PropTypes.number.isRequired,
    tag: PropTypes.string.isRequired
}));
