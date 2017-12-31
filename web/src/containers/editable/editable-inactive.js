import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatValue } from './format';

export default function EditableInactive({ item, value, onActivate }) {
    const className = classNames('editable', `editable-${item}`);

    const onMouseDown = () => onActivate();

    return <span className={className} onMouseDown={onMouseDown}>
        {formatValue(item, value)}
    </span>;
}

EditableInactive.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    onActivate: PropTypes.func.isRequired
};

