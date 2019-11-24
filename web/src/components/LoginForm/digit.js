import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './styles';

const Digit = ({ digit, onInput }) => (
    <Styled.Digit digit={digit} onMouseDown={() => onInput(digit)}>
        {digit}
    </Styled.Digit>
);

Digit.propTypes = {
    digit: PropTypes.number.isRequired,
    onInput: PropTypes.func.isRequired,
};

export default Digit;
