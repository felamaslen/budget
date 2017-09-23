/**
 * Editable form element component
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Editable extends Component {
    constructor(props) {
        super(props);

        this.inputProps = { type: 'text' };
    }
    format() {
        return this.props.value;
    }
    getDefaultValue() {
        return this.format();
    }
    getEditValue(rawInputValue) {
        return rawInputValue;
    }
    renderValue() {
        const thisClassName = `editable editable-${this.editableType}`;

        const onMouseDown = () => this.props.onActivate();

        return <span className={thisClassName} onMouseDown={onMouseDown}>
            {this.format()}
        </span>;
    }
    handleChange(evt) {
        return this.props.onChange(this.getEditValue(evt.target.value));
    }
    afterInput() {
        return null;
    }
    renderInput() {
        const ref = input => {
            this.input = input;
        };

        const defaultValue = this.getDefaultValue();
        const onChange = evt => this.handleChange(evt);

        return <span>
            <input ref={ref} className="editable-input" {...this.inputProps}
                defaultValue={defaultValue} onChange={onChange} />
            {this.afterInput()}
        </span>;
    }
    render() {
        if (this.props.active) {
            return this.renderInput();
        }

        return this.renderValue();
    }
}

Editable.propTypes = {
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    id: PropTypes.number,
    item: PropTypes.string.isRequired,
    value: PropTypes.string,
    active: PropTypes.bool.isRequired,
    onActivate: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};

