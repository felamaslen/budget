import React from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from '~client/components/FormField';
import { useField } from '~client/hooks/field';

export default function FormFieldNumber({ min, max, step, ...props }) {
    const [currentValue, onChange, ref, onBlur] = useField({
        ...props,
        setValue: Number
    });

    return (
        <Wrapper item="number" value={props.value} active={props.active}>
            <input
                ref={ref}
                type="number"
                value={currentValue}
                min={min}
                max={max}
                step={step}
                onChange={onChange}
                onBlur={onBlur}
            />
        </Wrapper>
    );
}

FormFieldNumber.propTypes = {
    value: PropTypes.number,
    active: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number
};

FormFieldNumber.defaultProps = {
    type: 'number',
    value: 0
};
