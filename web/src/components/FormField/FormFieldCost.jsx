import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';

export default class FormFieldCost extends FormField {
    onChange(evt) {
        const processed = Math.round(100 * parseFloat(evt.target.value, 10));

        return this.props.onChange(processed);
    }
    renderInput() {
        return <input type="number" step="0.01"
            defaultValue={this.props.value / 100}
            onChange={this.onChange} />;
    }
}

FormFieldCost.propTypes = {
    value: PropTypes.number.isRequired
};

