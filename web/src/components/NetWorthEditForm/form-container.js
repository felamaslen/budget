import React from 'react';
import PropTypes from 'prop-types';
import Navigation from '~client/components/NetWorthEditForm/navigation';

export default function FormContainer({ onComplete, children, onPrevStep, onNextStep, onFirstStep, onLastStep }) {
    return (
        <div className="net-worth-list-item">
            <button className="button-cancel" onClick={onComplete}>{'Cancel'}</button>
            <div className="net-worth-edit-form-section">
                {children}
            </div>
            <Navigation
                onPrevStep={onPrevStep}
                onNextStep={onNextStep}
                onFirstStep={onFirstStep}
                onLastStep={onLastStep}
            />
        </div>
    );
}

FormContainer.propTypes = {
    onComplete: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired
};
