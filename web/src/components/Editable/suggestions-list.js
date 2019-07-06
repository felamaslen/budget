import React from 'react';
import classNames from 'classnames';

import { suggestionsShape } from '~client/hooks/suggestions';

const SuggestionsList = ({ suggestions: { list, active } }) => (
    <ul className="suggestions">
        {list.map(value => (
            <li key={value} className={classNames('suggestion', {
                active: value === active
            })}>{value}</li>
        ))}
    </ul>
);

SuggestionsList.propTypes = {
    suggestions: suggestionsShape
};

export default SuggestionsList;
