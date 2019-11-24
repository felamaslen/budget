import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '~client/styled/shared/button';
import * as Styled from './styles';

export default function NextButton({ onPrevStep, onNextStep, onFirstStep, onLastStep }) {
    return (
        <Styled.FormNavigation>
            <Button onClick={onPrevStep} disabled={onFirstStep}>
                {'Previous'}
            </Button>
            <Button onClick={onNextStep}>{onLastStep ? 'Finish' : 'Next'}</Button>
        </Styled.FormNavigation>
    );
}

NextButton.propTypes = {
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired,
};
