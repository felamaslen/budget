import React, { useCallback } from 'react';

import { Wrapper } from './shared';

type Props = {
  item?: string;
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

export const FormFieldRange: React.FC<Props> = ({ item = '', value = 0, onChange, ...props }) => {
  const onChangeCallback = useCallback((event) => onChange(Number(event.target.value)), [onChange]);

  return (
    <Wrapper item={item}>
      <input {...props} type="range" value={value ?? 0} onChange={onChangeCallback} />
    </Wrapper>
  );
};
