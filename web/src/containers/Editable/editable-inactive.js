import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatValue } from './format';

export default function EditableInactive({ onActivate, ...props }) {
    const { item, value } = props;
    const className = classNames('editable', `editable-${item}`);

    return <span className={className} onMouseDown={() => onActivate(props)}>
        {formatValue(item, value)}
    </span>;
}

EditableInactive.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    onActivate: PropTypes.func.isRequired
};
