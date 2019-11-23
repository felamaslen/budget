import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Navigation from '~client/components/NetWorthEditForm/navigation';
import { ButtonCancel } from '~client/styled/shared/button';

import * as Styled from './styles';

export default function FormContainer({
    step,
    className,
    children,
    onComplete,
    onPrevStep,
    onNextStep,
    onFirstStep,
    onLastStep,
}) {
    return (
        <Styled.FormContainer className={classNames('net-worth-list-item', className)}>
            <ButtonCancel className="button-cancel" onClick={onComplete}>
                {'Cancel'}
            </ButtonCancel>
            <Styled.FormSection step={step} className="net-worth-edit-form-section">
                {children}
            </Styled.FormSection>
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
    step: null,
    className: {},
};

FormContainer.propTypes = {
    step: PropTypes.string,
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    item: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    onComplete: PropTypes.func.isRequired,
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired,
};
