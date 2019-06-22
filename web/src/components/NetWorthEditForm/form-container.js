import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Navigation from '~client/components/NetWorthEditForm/navigation';

export default function FormContainer({
    className,
    children,
    onComplete,
    onPrevStep,
    onNextStep,
    onFirstStep,
    onLastStep
}) {
    return (
        <div className={classNames('net-worth-list-item', className)}>
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

FormContainer.defaultProps = {
    className: {}
};

FormContainer.propTypes = {
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    item: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    onComplete: PropTypes.func.isRequired,
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired
};
