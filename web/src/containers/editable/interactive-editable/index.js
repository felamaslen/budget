import { List as list } from 'immutable';
import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SuggestionsList from '../suggestions-list';
import { getEditValue, getDefaultValue } from '../format';

export default class InteractiveEditable extends PureComponent {
    constructor(props) {
        super(props);

        this.input = null;
    }
    componentDidMount() {
        setTimeout(() => {
            if (this.input && this.input.focus) {
                this.input.focus();
            }
        }, 0);
    }
    render() {
        const { item, value, suggestionsList, suggestionsActive, onChange } = this.props;

        const inputRef = input => {
            this.input = input;
        };

        const onInputChange = evt => onChange(
            getEditValue(item, value, evt.target.value)
        );

        const className = classNames('active', 'editable', `editable-${item}`);

        const inputClassName = classNames('editable-input');

        return <span className={className}>
            <input
                ref={inputRef}
                className={inputClassName}
                type="text"
                defaultValue={getDefaultValue(item, value)}
                onChange={onInputChange}
            />
            <SuggestionsList suggestionsList={suggestionsList} suggestionsActive={suggestionsActive} />
        </span>;
    }
}

InteractiveEditable.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    suggestionsList: PropTypes.instanceOf(list),
    suggestionsActive: PropTypes.number,
    onChange: PropTypes.func.isRequired
};

