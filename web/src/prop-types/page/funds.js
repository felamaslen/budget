import PropTypes from 'prop-types';

export const gainShape = PropTypes.shape({
    value: PropTypes.number,
    gain: PropTypes.number,
    gainAbs: PropTypes.number,
    dayGain: PropTypes.number,
    dayGainAbs: PropTypes.number,
    color: PropTypes.arrayOf(PropTypes.number.isRequired)
});
