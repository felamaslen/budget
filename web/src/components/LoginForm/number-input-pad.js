import React from 'react';
import PropTypes from 'prop-types';

import Digit from './digit';

export default function NumberInputPad({ onInput }) {
    const digits = new Array(4)
        .fill(0)
        .map((item, rowKey) => {
            if (rowKey < 3) {
                const row = new Array(3)
                    .fill(0)
                    .map((column, colKey) => {
                        const digit = (rowKey * 3 + colKey + 1) % 10;

                        return <Digit key={digit} digit={digit} onInput={onInput} />;
                    });

                return <div key={rowKey} className="number-input-row">{row}</div>;
            }

            return <div key={rowKey} className="number-input-row">
                <Digit digit={0} onInput={onInput} />
            </div>;
        });

    return <div className="number-input noselect">{digits}</div>;
}

NumberInputPad.propTypes = {
    onInput: PropTypes.func.isRequired
};

