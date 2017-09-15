/**
 * Editable form element component - currency
 */

import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Editable from './Editable';
import { aSuggestionsRequested } from '../../actions/EditActions';
import debounce from '../../misc/debounce';

export default class EditableText extends Editable {
    constructor(props) {
        super(props);
        this.editableType = 'text';
        this.loadSuggestions = debounce(this.loadSuggestions, 100, false, this);
    }
    loadSuggestions(value) {
        this.dispatchAction(aSuggestionsRequested(value));
    }
    handleChange(evt) {
        super.handleChange(evt);
        // load suggestions
        if (this.props.suggestions) {
            this.loadSuggestions(evt.target.value);
        }
    }
    afterInput() {
        if (!this.props.active || !this.props.suggestions ||
        !this.props.suggestions.size) {
            return null;
        }

        return (
            <ul className="suggestions">
                {this.props.suggestions.get('list').map((item, key) => {
                    const classes = classNames({
                        suggestion: true,
                        active: this.props.suggestions.get('active') === key
                    });

                    return <li key={key} className={classes}>{item}</li>;
                })}
            </ul>
        );
    }
}

EditableText.propTypes = {
    value: PropTypes.string,
    suggestions: PropTypes.instanceOf(map)
};

