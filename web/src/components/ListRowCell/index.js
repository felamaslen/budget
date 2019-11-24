import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';

import Editable from '~client/components/Editable';
import * as Styled from './styles';

function ListRowCell({
    page,
    id,
    column,
    value,
    active,
    setActive,
    command,
    small,
    onSuggestionConfirmed,
    onUpdate,
}) {
    const onSuggestion = useCallback(
        (suggestion, next) => {
            onUpdate(column, suggestion);
            setImmediate(() => onSuggestionConfirmed(column, next));
        },
        [onUpdate, onSuggestionConfirmed, column],
    );

    const onSetActive = useCallback(() => setActive(id, column), [setActive, id, column]);

    const onChange = useCallback(
        (editColumn, newValue) => {
            if (typeof newValue === 'string' && !newValue.length) {
                return;
            }

            onUpdate(editColumn, newValue);
        },
        [onUpdate],
    );

    return (
        <Styled.Cell column={column} active={active} onMouseDown={onSetActive}>
            <Editable
                page={page}
                id={id}
                onChange={onChange}
                active={active}
                item={column}
                value={value}
                small={small}
                onSuggestion={onSuggestion}
                command={command}
            />
        </Styled.Cell>
    );
}

ListRowCell.propTypes = {
    page: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    column: PropTypes.string.isRequired,
    onSuggestionConfirmed: PropTypes.func.isRequired,
    value: PropTypes.any,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    command: PropTypes.object,
    small: PropTypes.bool,
    onUpdate: PropTypes.func.isRequired,
};

export default memo(ListRowCell);
