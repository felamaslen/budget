import PropTypes from 'prop-types';

export const timelineShape = PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
);

export const subTreeShape = PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired
}));

export const costShape = PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    subTree: subTreeShape
}));

export const listTreeHeadItemsShape = PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    itemCost: PropTypes.number.isRequired,
    pct: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    open: PropTypes.bool.isRequired,
    subTree: subTreeShape
}));
