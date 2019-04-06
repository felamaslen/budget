import PropTypes from 'prop-types';

export const lineGraphPropTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array.isRequired
};

export const rangePropTypes = {
    minX: PropTypes.number.isRequired,
    maxX: PropTypes.number.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired
};

export const pixelPropTypes = {
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    valX: PropTypes.func.isRequired,
    valY: PropTypes.func.isRequired
};

