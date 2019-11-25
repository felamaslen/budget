import React from 'react';
import PropTypes from 'prop-types';

import Navigation from '~client/components/NetWorthEditForm/navigation';
import { ButtonCancel } from '~client/styled/shared/button';

import * as Styled from './styles';

export default function FormContainer({
    add,
    step,
    children,
    onComplete,
    onPrevStep,
    onNextStep,
    onFirstStep,
    onLastStep,
}) {
    return (
        <Styled.FormContainer add={add}>
            <ButtonCancel onClick={onComplete}>{'Cancel'}</ButtonCancel>
            <Styled.FormSection step={step}>{children}</Styled.FormSection>
            <Navigation
                onPrevStep={onPrevStep}
                onNextStep={onNextStep}
                onFirstStep={onFirstStep}
                onLastStep={onLastStep}
            />
        </Styled.FormContainer>
    );
}

FormContainer.defaultProps = {
    add: false,
    step: null,
};

FormContainer.propTypes = {
    add: PropTypes.bool,
    step: PropTypes.string,
    item: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    onComplete: PropTypes.func.isRequired,
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired,
};
