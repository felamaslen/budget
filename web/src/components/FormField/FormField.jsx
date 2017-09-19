import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';

export default class FormField extends PureControllerView {
    renderInput() {
        const onChange = evt => this.props.onChange(evt.target.value);

        return <input type="text"
            defaultValue={this.props.value}
            onChange={onChange} />;
    }
    render() {
        return <div className="form-field">
            {this.renderInput()}
        </div>;
    }
}

FormField.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func
};

