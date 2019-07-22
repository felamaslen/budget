import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from '~client/components/FormField';

function FormFieldSelect({ options, value, onChange, ...props }) {
    const onChangeCallback = useCallback(event => onChange(event.target.value), [onChange]);

    useEffect(() => {
        if (options.length && !options.some(({ internal }) => internal === value)) {
            onChange(options[0].internal);
        }
    }, [onChange, options, value]);

    return (
        <Wrapper active {...props}>
            <select value={value} onChange={onChangeCallback} {...props}>
                {options.map(({ internal, external = internal }) => (
                    <option key={internal} value={internal}>
                        {external}
                    </option>
                ))}
            </select>
        </Wrapper>
    );
}

FormFieldSelect.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        internal: PropTypes.string.isRequired,
        external: PropTypes.string
    }).isRequired).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default FormFieldSelect;
