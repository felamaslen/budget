import PropTypes from 'prop-types';

export const gainShape = PropTypes.shape({
    value: PropTypes.number,
    gain: PropTypes.number,
    gainAbs: PropTypes.number,
    dayGain: PropTypes.number,
    dayGainAbs: PropTypes.number,
    color: PropTypes.arrayOf(PropTypes.number.isRequired),
});

export const fundItemShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    color: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    item: PropTypes.string.isRequired,
});

export const cachedValueShape = PropTypes.shape({
    value: PropTypes.number.isRequired,
    dayGain: PropTypes.number.isRequired,
    dayGainAbs: PropTypes.number.isRequired,
    ageText: PropTypes.string.isRequired,
});
