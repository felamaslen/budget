/**
 * Editable form element component
 */

import React from 'react';
import PropTypes from 'prop-types';
import EditableActive from './editable-active';
import EditableInactive from './editable-inactive';

export default function Editable({ active, ...props }) {
    if (active) {
        return <EditableActive {...props} />;
    }

    return <EditableInactive {...props} />;
}

Editable.propTypes = {
    active: PropTypes.bool.isRequired
};

