import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatItem } from '~client/modules/format';
import { useField } from '~client/hooks/field';

export const Wrapper = ({ item, value, active, children }) => (
    <div className={classNames('form-field', `form-field-${item}`, active)}>
        {active && children}
        {!active && formatItem(item, value)}
    </div>
);

Wrapper.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    active: PropTypes.bool,
    children: PropTypes.node.isRequired
};

Wrapper.defaultProps = {
    active: true
};

export default function FormFieldText({ label, item, ...props }) {
    const [currentValue, , onChange, ref, onBlur] = useField(props);

    return (
        <Wrapper item={item} value={props.value} active={props.active}>
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
    active: PropTypes.bool
};

FormFieldText.defaultProps = {
    label: null,
    item: 'text',
    value: ''
};
