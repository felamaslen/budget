import React from 'react';
import PropTypes from 'prop-types';

import { LOGIN_INPUT_LENGTH } from '~client/constants/data';

import * as Styled from './styles';

const PinDisplay = ({ inputStep }) => (
    <Styled.PinDisplay>
        {new Array(LOGIN_INPUT_LENGTH).fill(0).map((item, index) => (
            <Styled.InputPin
                key={index}
                active={index === inputStep}
                done={index < inputStep}
            />
        ))}
    </Styled.PinDisplay>
);

PinDisplay.propTypes = {
    inputStep: PropTypes.number.isRequired,
};

export default PinDisplay;
