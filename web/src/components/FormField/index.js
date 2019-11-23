import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatItem } from '~client/modules/format';
import { useField } from '~client/hooks/field';

import * as Styled from './styles';

export const Wrapper = ({ item, value, active, small, children }) => (
    <Styled.FormField
        className={classNames('form-field', `form-field-${item}`, active)}
        item={item}
        active={active}
        small={small}
    >
        {active && children}
        {!active && formatItem(item, value)}
    </Styled.FormField>
);

Wrapper.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    active: PropTypes.bool,
    small: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

Wrapper.defaultProps = {
    active: true,
    small: false,
};

export default function FormFieldText({ label, item, ...props }) {
    const [currentValue, , onChange, ref, onBlur] = useField(props);

    return (
        <Wrapper item={item} value={props.value} active={props.active} small={props.small}>
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
    small: PropTypes.bool,
};

FormFieldText.defaultProps = {
    label: null,
    item: 'text',
    value: '',
};
