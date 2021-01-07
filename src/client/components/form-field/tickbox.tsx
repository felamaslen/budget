import React, { useCallback } from 'react';

import { Wrapper, WrapperProps } from './shared';

type Props = WrapperProps & {
  value: boolean;
  onChange: (value: boolean) => void;
};

export const FormFieldTickbox: React.FC<Props> = ({ value, onChange, ...props }) => {
  const onChangeCallback = useCallback(() => onChange(!value), [onChange, value]);

  return (
    <Wrapper {...props}>
      <input
        data-testid="checkbox"
        type="checkbox"
        checked={value}
        onChange={onChangeCallback}
        {...props}
      />
    </Wrapper>
  );
};
