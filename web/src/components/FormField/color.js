import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SketchPicker } from 'react-color';
import { Button } from '~client/styled/shared/button';

import * as Styled from './styles';

export default function FormFieldColor({ value, onChange }) {
    const [active, setActive] = useState(false);
    const toggle = useCallback(() => setActive(last => !last), []);

    const onChangeComplete = useCallback(
        color => {
            onChange(color.hex);
        },
        [onChange],
    );

    return (
        <Styled.FormColor
            className={classNames('form-field', 'form-field-color')}
        >
            <Button className="color-value" onClick={toggle}>
                {'Edit colour'}
            </Button>
            {active && (
                <SketchPicker
                    className="color-picker"
                    color={value}
                    onChangeComplete={onChangeComplete}
                />
            )}
        </Styled.FormColor>
    );
}

FormFieldColor.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
