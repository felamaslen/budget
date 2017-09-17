import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';

export default class FormFieldNumber extends FormField {
    onChange(evt) {
        return this.props.onChange(parseFloat(evt.target.value, 10));
    }
    renderInput() {
        return <input type="number"
            defaultValue={this.props.value}
            onChange={this.onChange} />;
    }
}

FormFieldNumber.propTypes = {
    value: PropTypes.number.isRequired
};


