/**
 * Editable form element component - currency
 */

import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Editable from '.';

export default class EditableText extends Editable {
    constructor(props) {
        super(props);

        this.editableType = 'text';
    }
    handleChange(evt) {
        super.handleChange(evt);

        // load suggestions
        if (this.props.suggestionsList) {
            this.props.requestSuggestions(evt.target.value);
        }
    }
    afterInput() {
        if (!(this.props.active && this.props.suggestionsList &&
            this.props.suggestionsList.size)) {

            return null;
        }

        const suggestionsList = this.props.suggestionsList
            .map((item, key) => {
                const classes = classNames('suggestion', {
                    active: this.props.suggestionsActive === key
                });

                return <li key={key} className={classes}>{item}</li>;
            });

        return <ul className="suggestions">
            {suggestionsList}
        </ul>;
    }
}

EditableText.propTypes = {
    value: PropTypes.string.isRequired,
    suggestionsList: PropTypes.instanceOf(list),
    suggestionsActive: PropTypes.number
};

