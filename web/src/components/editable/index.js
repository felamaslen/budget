/**
 * Editable form element component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from '../../immutable-component';
import classNames from 'classnames';

export default class Editable extends PureComponent {
    constructor(props) {
        super(props);

        this.inputProps = { type: 'text' };
    }
    focusInput() {
        setTimeout(() => this.input && this.input.focus && this.input.focus(), 0);
    }
    componentDidMount() {
        if (this.props.active) {
            this.focusInput();
        }
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.active && this.props.active) {
            this.focusInput();
        }
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

        const outerClass = classNames({ active: this.props.active });

        return <span className={outerClass}>
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
    static: PropTypes.bool,
    onActivate: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};

