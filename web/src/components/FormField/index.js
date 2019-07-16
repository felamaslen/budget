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

export default function FormFieldText(props) {
    const [currentValue, onChange, ref, onBlur] = useField(props);

    return (
        <Wrapper item="text" value={props.value} active={props.active}>
            <input
                ref={ref}
                type="text"
                value={currentValue}
                onChange={onChange}
                onBlur={onBlur}
            />
        </Wrapper>
    );
}

FormFieldText.propTypes = {
    value: PropTypes.string,
    active: PropTypes.bool
};

FormFieldText.defaultProps = {
    value: ''
};
