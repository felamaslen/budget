import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '~client/styled/shared/button';

export default function NextButton({
    onPrevStep,
    onNextStep,
    onFirstStep,
    onLastStep,
}) {
    return (
        <div className="net-worth-edit-form-navigation">
            <Button
                className="button-prev-step"
                onClick={onPrevStep}
                disabled={onFirstStep}
            >
                {'Previous'}
            </Button>
            <Button className="button-next-step" onClick={onNextStep}>
                {onLastStep ? 'Finish' : 'Next'}
            </Button>
        </div>
    );
}

NextButton.propTypes = {
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired,
};
