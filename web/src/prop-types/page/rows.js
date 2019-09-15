import PropTypes from 'prop-types';

export const rowShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
});

export const rowsShape = PropTypes.arrayOf(rowShape.isRequired);
