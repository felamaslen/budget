import React from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from '~client/components/FormField';
import { useField } from '~client/hooks/field';

const setValue = cost => Math.round(100 * (Number(cost) || 0));

export default function FormFieldCost(props) {
    const [currentValue, onChange, ref, onBlur] = useField({
        ...props,
        setValue
    });

    const inputProps = props.string
        ? { type: 'text' }
        : { type: 'number', step: 0.01 };

    return (
        <Wrapper item="cost" value={props.value} active={props.active}>
            <input
                ref={ref}
                {...inputProps}
                value={currentValue === null || typeof currentValue === 'string'
                    ? ''
                    : currentValue / 100
                }
                onChange={onChange}
                onBlur={onBlur}
            />
        </Wrapper>
    );
}

FormFieldCost.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    active: PropTypes.bool,
    string: PropTypes.bool
};

FormFieldCost.defaultProps = {
    string: false,
    value: null
};
