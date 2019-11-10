import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Button } from '~client/styled/shared/button';
import Navigation from '~client/components/NetWorthEditForm/navigation';

export default function FormContainer({
    className,
    children,
    onComplete,
    onPrevStep,
    onNextStep,
    onFirstStep,
    onLastStep,
}) {
    return (
        <div className={classNames('net-worth-list-item', className)}>
            <Button className="button-cancel" onClick={onComplete}>
                {'Cancel'}
            </Button>
            <div className="net-worth-edit-form-section">{children}</div>
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
    className: {},
};

FormContainer.propTypes = {
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    item: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    onComplete: PropTypes.func.isRequired,
    onPrevStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFirstStep: PropTypes.bool.isRequired,
    onLastStep: PropTypes.bool.isRequired,
};
