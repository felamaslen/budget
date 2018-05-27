import React from 'react';
import ImmutableComponent from '../../../ImmutableComponent';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SuggestionsList from '../suggestions-list';
import { getEditValue, getDefaultValue } from '../format';

export default class InteractiveEditable extends ImmutableComponent {
    constructor(props) {
        super(props);

        this.input = null;
    }
    componentDidMount() {
        setImmediate(() => {
            if (this.input && this.input.focus && this.input.select) {
                this.input.focus();
                this.input.select();
            }
        });
    }
    render() {
        const { item, value, onChange } = this.props;

        const inputRef = input => {
            this.input = input;
        };

        const onInputChange = evt => onChange(getEditValue(item, value, evt.target.value));

        const className = classNames('active', 'editable', `editable-${item}`);

        const inputClassName = classNames('editable-input');

        return <span className={className}>
            <input
                ref={inputRef}
                className={inputClassName}
                type="text"
                defaultValue={getDefaultValue(item, value)}
                onChange={onInputChange}
            />
            <SuggestionsList />
        </span>;
    }
}

InteractiveEditable.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired
};

