import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SuggestionsList from '../suggestions-list';
import { getEditValue, getDefaultValue } from '../format';

export default function InteractiveEditable({ item, value, onChange }) {
    const input = useRef(null);

    useEffect(() => {
        setImmediate(() => {
            if (input.current) {
                if (input.current.focus) {
                    input.current.focus();
                }
                if (input.current.select) {
                    input.current.select();
                }
            }
        });
    }, []);

    const onInputChange = useCallback(evt => onChange(getEditValue(item, value, evt.target.value)),
        [item, value, onChange]);

    const className = classNames('active', 'editable', `editable-${item}`);

    const inputClassName = classNames('editable-input');

    return (
        <span className={className}>
            <input
                ref={input}
                className={inputClassName}
                type="text"
                defaultValue={getDefaultValue(item, value)}
                onChange={onInputChange}
            />
            <SuggestionsList />
        </span>
    );
}

InteractiveEditable.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired
};
