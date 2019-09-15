import React from 'react';
import PropTypes from 'prop-types';

export default function AppLogo({ loading, unsaved }) {
    const unsavedChanges = unsaved
        ? <span className="queue-not-saved">{'Unsaved changes!'}</span>
        : null;

    const loadingSpinner = loading
        ? <span className="loading-api" />
        : null;

    return <div className="app-logo">
        {unsavedChanges}
        <a className="logo">
            <span>{'Budget'}</span>
            {loadingSpinner}
        </a>
    </div>;
}

AppLogo.propTypes = {
    loading: PropTypes.bool.isRequired,
    unsaved: PropTypes.bool.isRequired,
};
