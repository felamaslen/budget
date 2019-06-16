import React from 'react';
import PropTypes from 'prop-types';

export default function FormContainer({ onComplete, children }) {
    return (
        <div className="net-worth-list-item">
            <button className="button-back" onClick={onComplete}>{'Back'}</button>
            <div className="net-worth-edit-form-section">
                {children}
            </div>
        </div>
    );
}

FormContainer.propTypes = {
    onComplete: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
};
