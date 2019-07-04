import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { LOGIN_INPUT_LENGTH } from '~client/constants/data';

const PinDisplay = ({ inputStep }) => (
    <div className="pin-display">{new Array(LOGIN_INPUT_LENGTH).fill(0)
        .map((item, index) => (
            <div key={index} className={classNames('input-pin', {
                active: index === inputStep,
                done: index < inputStep
            })} />
        ))
    }</div>
);

PinDisplay.propTypes = {
    inputStep: PropTypes.number.isRequired
};

export default PinDisplay;
