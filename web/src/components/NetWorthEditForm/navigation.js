import React from 'react';
import PropTypes from 'prop-types';

export default function NextButton({
    onPrevStep, onNextStep, onFirstStep, onLastStep,
}) {
    return (
        <div className="net-worth-edit-form-navigation">
            <button className="button-prev-step" onClick={onPrevStep} disabled={onFirstStep}>
                {'Previous'}
            </button>
            <button className="button-next-step" onClick={onNextStep}>
                {onLastStep
                    ? 'Finish'
                    : 'Next'
                }
            </button>
        </div>
    );
}

NextButton.propTypes = {
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired,
};
