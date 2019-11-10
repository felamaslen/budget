import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from '~client/styled/shared/button';

const Digit = ({ digit, onInput }) => (
    <Button
        className={classNames('btn-digit', `btn-digit-${digit}`)}
        onMouseDown={() => onInput(digit)}
    >
        {digit}
    </Button>
);

Digit.propTypes = {
    digit: PropTypes.number.isRequired,
    onInput: PropTypes.func.isRequired,
};

export default Digit;
