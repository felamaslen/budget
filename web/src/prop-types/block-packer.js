import PropTypes from 'prop-types';

const dimension = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);
const color = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

export const subBlockBitShape = PropTypes.shape({
    name: PropTypes.string,
    color,
    width: dimension,
    height: dimension,
    value: PropTypes.number
}).isRequired;

export const subBlockShape = PropTypes.shape({
    width: dimension,
    height: dimension,
    bits: PropTypes.arrayOf(subBlockBitShape)
}).isRequired;

export const blockBitShape = PropTypes.shape({
    name: PropTypes.string.isRequired,
    color,
    value: PropTypes.number.isRequired,
    width: dimension,
    height: dimension,
    blocks: PropTypes.arrayOf(subBlockShape)
}).isRequired;

export const blockShape = PropTypes.shape({
    width: dimension,
    height: dimension,
    bits: PropTypes.arrayOf(blockBitShape)
}).isRequired;

export const blocksShape = PropTypes.arrayOf(blockShape);
