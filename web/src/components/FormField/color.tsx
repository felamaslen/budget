import React, { useState, useCallback } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

import { Button } from '~client/styled/shared/button';

import * as Styled from './styles';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

const FormFieldColor: React.FC<Props> = ({ value, onChange }) => {
  const [active, setActive] = useState<boolean>(false);
  const toggle = useCallback(() => setActive(last => !last), []);

  const onChangeComplete = useCallback(
    (color: ColorResult) => {
      onChange(color.hex);
    },
    [onChange],
  );

  return (
    <Styled.FormColor>
      <Button onClick={toggle}>{'Edit colour'}</Button>
      {active && <SketchPicker color={value} onChangeComplete={onChangeComplete} />}
    </Styled.FormColor>
  );
};

export default FormFieldColor;
