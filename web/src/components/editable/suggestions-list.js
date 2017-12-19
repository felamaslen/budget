import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function SuggestionsList({ suggestionsList, suggestionsActive }) {
    if (suggestionsList && suggestionsList.size) {
        const itemList = suggestionsList
            .map((suggestion, key) => {
                const className = classNames('suggestion', {
                    active: suggestionsActive === key
                });

                return <li key={key} className={className}>{suggestion}</li>;
            });

        return <ul className="suggestions">
            {itemList}
        </ul>;
    }

    return null;
}

SuggestionsList.propTypes = {
    suggestionsList: PropTypes.instanceOf(list),
    suggestionsActive: PropTypes.number
};

