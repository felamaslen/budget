import PropTypes from 'prop-types';

export const lineGraphPropTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array.isRequired,
};

export const rangePropTypes = {
    minX: PropTypes.number,
    maxX: PropTypes.number,
    minY: PropTypes.number,
    maxY: PropTypes.number,
};

export const pixelPropTypes = {
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    valX: PropTypes.func.isRequired,
    valY: PropTypes.func.isRequired,
};

export const dataShape = PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
);

export const lineShape = PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    data: dataShape.isRequired,
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.shape({
            changes: PropTypes.array.isRequired,
            values: PropTypes.array.isRequired,
        }),
    ]).isRequired,
    strokeWidth: PropTypes.number,
    dashed: PropTypes.bool,
    fill: PropTypes.bool,
    smooth: PropTypes.bool,
    movingAverage: PropTypes.number,
    arrows: PropTypes.bool,
});
