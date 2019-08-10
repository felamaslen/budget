import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PAGES, PAGES_SUGGESTIONS } from '~client/constants/data';
import SuggestionsList from '~client/components/SuggestionsList';
import FormFieldText from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldTransactions from '~client/components/FormField/transactions';

import './style.scss';

function EditableField({ item, onChange, ...rest }) {
    const onChangeCallback = useCallback(value => onChange(item, value), [onChange, item]);

    const props = { ...rest, onChange: onChangeCallback };

    if (item === 'date') {
        return <FormFieldDate string label="date-input" {...props} />;
    }
    if (item === 'cost') {
        return <FormFieldCost string label="cost-input" {...props} />;
    }
    if (item === 'transactions') {
        return <FormFieldTransactions create {...props} />;
    }

    return <FormFieldText string label={`${item}-input`} {...props} />;
}

EditableField.propTypes = {
    item: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default function Editable({ page, active, item, onSuggestion, ...props }) {
    const [typed, onType] = useState('');
    useEffect(() => {
        if (!active) {
            onType('');
        }
    }, [active]);

    const showSuggestions = Boolean(active &&
        typed.length &&
        PAGES_SUGGESTIONS.includes(page) &&
        PAGES[page].suggestions &&
        PAGES[page].suggestions.includes(item));

    return (
        <span className={classNames('editable', `editable-${item}`, {
            'editable-active': active,
            'editable-inactive': !active
        })}>
            <EditableField
                active={active}
                item={item}
                onType={onType}
                {...props}
            />
            {showSuggestions && (
                <SuggestionsList
                    page={page}
                    column={item}
                    search={typed}
                    onConfirm={onSuggestion}
                />
            )}
        </span>
    );
}

Editable.propTypes = {
    page: PropTypes.string.isRequired,
    active: PropTypes.bool,
    item: PropTypes.string.isRequired,
    onSuggestion: PropTypes.func,
    onChange: PropTypes.func
};

Editable.defaultProps = {
    active: false,
    value: '',
    onSuggestion: () => null,
    onChange: () => null
};