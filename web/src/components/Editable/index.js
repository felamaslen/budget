import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import { formatCurrency } from '~client/modules/format';
import { suggestionsShape } from '~client/hooks/suggestions';
import SuggestionsList from '~client/components/Editable/suggestions-list';
import FormFieldText from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldTransactions from '~client/components/FormField/transactions';

import './style.scss';

function EditableActive({ item, onChange, ...rest }) {
    const onChangeCallback = useCallback(value => onChange(item, value), [onChange, item]);

    const props = { ...rest, onChange: onChangeCallback };

    if (item === 'date') {
        return <FormFieldDate {...props} />;
    }
    if (item === 'cost') {
        return <FormFieldCost {...props} />;
    }
    if (item === 'transactions') {
        return <FormFieldTransactions {...props} />;
    }

    return <FormFieldText {...props} />;
}

EditableActive.propTypes = {
    item: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

function formatValue(item, value) {
    if (item === 'date') {
        return value.toLocaleString(DateTime.DATE_SHORT);
    }
    if (item === 'cost') {
        return formatCurrency(value);
    }
    if (item === 'transactions') {
        return <span className="num-transactions">{value
            ? value.length
            : 0
        }</span>;
    }

    return String(value);
}

export default function Editable(props) {
    const { active, item, value } = props;

    if (active) {
        return (
            <span className={classNames('editable', `editable-${item}`, 'editable-active')}>
                <EditableActive {...props} />
                {props.suggestions.list.length && <SuggestionsList {...props} />}
            </span>
        );
    }

    return (
        <span className={item}>
            <span className={classNames('editable', `editable-${item}`, 'editable-inactive')}>
                {formatValue(item, value)}
            </span>
        </span>
    );
}

Editable.propTypes = {
    active: PropTypes.bool,
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    suggestions: suggestionsShape,
    onType: PropTypes.func,
    onChange: PropTypes.func
};

Editable.defaultProps = {
    active: false,
    suggestions: {
        list: [],
        active: null,
        next: []
    },
    onType: () => null,
    onChange: () => null
};
