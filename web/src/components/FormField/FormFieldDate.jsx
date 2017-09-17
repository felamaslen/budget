import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import { YMD } from '../../misc/date';

export default class FormFieldDate extends FormField {
    onChange(evt) {
        const processed = new YMD(evt.target.value);

        if (!processed.valid) {
            return this.props.onChange(null);
        }

        return this.props.onChange(processed);
    }
    renderInput() {
        return <input type="date"
            defaultValue={this.props.value.formatISO()}
            onChange={this.onChange} />;
    }
}

FormFieldDate.propTypes = {
    value: PropTypes.instanceOf(YMD)
};

