import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { LOGIN_INPUT_LENGTH } from '../../misc/const';

export default function PinDisplay({ inputStep }) {
    const digitBoxes = new Array(LOGIN_INPUT_LENGTH)
        .fill(0)
        .map((item, key) => {
            const className = classNames({
                'input-pin': true,
                active: key === inputStep,
                done: key < inputStep
            });

            return <div key={key} className={className} />;
        });

    return <div className="pin-display">{digitBoxes}</div>;
}

PinDisplay.propTypes = {
    inputStep: PropTypes.number.isRequired
};

