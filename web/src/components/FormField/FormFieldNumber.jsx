import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';

export default class FormFieldNumber extends FormField {
    onChange(evt) {
        return this.props.onChange(parseFloat(evt.target.value, 10));
    }
    renderInput() {
        const onChange = evt => this.onChange(evt);

        return <input type="number"
            defaultValue={this.props.value}
            onChange={onChange} />;
    }
}

FormFieldNumber.propTypes = {
    value: PropTypes.number.isRequired
};


