import React from 'react';
import PropTypes from 'prop-types';

import { formatItem } from '~client/modules/format';
import { useField } from '~client/hooks/field';

import * as Styled from './styles';

export const Wrapper = ({ item, value, active, invalid, small, children }) => (
    <Styled.FormField item={item} active={active} invalid={invalid} small={small}>
        {active && children}
        {!active && formatItem(item, value)}
    </Styled.FormField>
);

Wrapper.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    active: PropTypes.bool,
    invalid: PropTypes.bool,
    small: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

Wrapper.defaultProps = {
    active: true,
    invalid: false,
    small: false,
};

export default function FormFieldText({ label, item, invalid, ...props }) {
    const [currentValue, , onChange, ref, onBlur] = useField(props);

    return (
        <Wrapper
            item={item}
            value={props.value}
            active={props.active}
            invalid={invalid}
            small={props.small}
        >
            <input
                ref={ref}
                aria-label={label}
                type="text"
                value={currentValue}
                onChange={onChange}
                onBlur={onBlur}
            />
        </Wrapper>
    );
}

FormFieldText.propTypes = {
    label: PropTypes.string,
    item: PropTypes.string,
    value: PropTypes.string,
    active: PropTypes.bool,
    invalid: PropTypes.bool,
    small: PropTypes.bool,
};

FormFieldText.defaultProps = {
    label: null,
    item: 'text',
    value: '',
    invalid: false,
    small: false,
};
