import React, { useCallback } from 'react';

import { Wrapper } from '.';

type Props = {
  item?: string;
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

const FormFieldRange: React.FC<Props> = ({ item = '', value = 0, onChange, min, max, step }) => {
  const onChangeCallback = useCallback(event => onChange(Number(event.target.value)), [onChange]);

  return (
    <Wrapper item={item} value={value} active>
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
};

export default FormFieldRange;
