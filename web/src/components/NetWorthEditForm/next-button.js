import React from 'react';
import PropTypes from 'prop-types';

export default function NextButton({ onNextStep, onLastStep }) {
    const text = onLastStep
        ? 'Finish'
        : 'Next';

    return (
        <button onClick={onNextStep}>
            {text}
        </button>
    );
}

NextButton.propTypes = {
    onNextStep: PropTypes.func.isRequired,
    onLastStep: PropTypes.bool.isRequired
};
