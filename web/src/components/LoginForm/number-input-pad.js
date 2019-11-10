import React from 'react';
import PropTypes from 'prop-types';

import Digit from '~client/components/LoginForm/digit';

import * as Styled from './styles';

const getDigit = (row, col) => (row * 3 + col + 1) % 10;

const NumberInputPad = ({ onInput }) => (
    <Styled.NumberInputPad className="number-input">
        {new Array(4).fill(0).map((item, row) => {
            if (row === 3) {
                return (
                    <div key={row} className="number-input-row">
                        <Digit digit={0} onInput={onInput} />
                    </div>
                );
            }

            return (
                <div key={row} className="number-input-row">
                    {new Array(3).fill(0).map((colItem, col) => (
                        <Digit
                            key={getDigit(row, col)}
                            digit={getDigit(row, col)}
                            onInput={onInput}
                        />
                    ))}
                </div>
            );
        })}
    </Styled.NumberInputPad>
);

NumberInputPad.propTypes = {
    onInput: PropTypes.func.isRequired,
};

export default NumberInputPad;
