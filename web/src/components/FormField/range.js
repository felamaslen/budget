import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from '~client/components/FormField';

export default function FormFieldRange({
    item, value, onChange, min, max, step,
}) {
    const onChangeCallback = useCallback((event) => onChange(Number(event.target.value)), [onChange]);

    return (
        <Wrapper item={item} active>
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={onChangeCallback}
            />
        </Wrapper>
    );
}

FormFieldRange.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
};

FormFieldRange.defaultProps = {
    value: 0,
};
