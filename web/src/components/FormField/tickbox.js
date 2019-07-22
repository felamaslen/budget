import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from '~client/components/FormField';

function FormFieldTickbox({ value, onChange, ...props }) {
    const onChangeCallback = useCallback(() => onChange(!value), [onChange, value]);

    return (
        <Wrapper active {...props}>
            <input
                type="checkbox"
                checked={value}
                onChange={onChangeCallback}
                {...props}
            />
        </Wrapper>
    );
}

FormFieldTickbox.propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

export default FormFieldTickbox;
