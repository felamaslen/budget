import React from 'react';
import PropTypes from 'prop-types';

export default function Digit({ digit, onInput }) {
    const btnClass = `btn-digit btn-digit-${digit}`;

    return <button className={btnClass} onMouseDown={() => onInput(digit)}>
        {digit}
    </button>;
}

Digit.propTypes = {
    digit: PropTypes.number.isRequired,
    onInput: PropTypes.func.isRequired
};

