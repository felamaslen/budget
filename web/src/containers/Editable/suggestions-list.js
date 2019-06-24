import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function SuggestionsList({ suggestionsList, suggestionsActive }) {
    if (!(suggestionsList && suggestionsList.length)) {
        return null;
    }

    return (
        <ul className="suggestions">
            {suggestionsList.map((suggestion, index) => (
                <li key={suggestion}
                    className={classNames('suggestion', { active: index === suggestionsActive })}
                >{suggestion}</li>
            ))}
        </ul>
    );
}

SuggestionsList.propTypes = {
    suggestionsList: PropTypes.arrayOf(PropTypes.string.isRequired),
    suggestionsActive: PropTypes.number
};

const mapStateToProps = state => ({
    suggestionsList: state.editSuggestions.list,
    suggestionsActive: state.editSuggestions.active
});

export default connect(mapStateToProps)(SuggestionsList);
