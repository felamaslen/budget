import PropTypes from 'prop-types';

export const category = PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['asset', 'liability']).isRequired,
    category: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
});

export const subcategory = PropTypes.shape({
    categoryId: PropTypes.string.isRequired,
    subcategory: PropTypes.string.isRequired,
    hasCreditLimit: PropTypes.bool,
    opacity: PropTypes.number.isRequired,
});
