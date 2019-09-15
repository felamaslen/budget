import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Digit = ({ digit, onInput }) => (
    <button className={classNames('btn-digit', `btn-digit-${digit}`)}
        onMouseDown={() => onInput(digit)}
    >{digit}</button>
);

Digit.propTypes = {
    digit: PropTypes.number.isRequired,
    onInput: PropTypes.func.isRequired,
};

export default Digit;
