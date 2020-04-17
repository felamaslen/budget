import React, { useCallback } from 'react';

import { Wrapper, WrapperProps } from '.';

type Props = WrapperProps<boolean> & {
  onChange: (value: boolean) => void;
};

const FormFieldTickbox: React.FC<Props> = ({ value, onChange, ...props }) => {
  const onChangeCallback = useCallback(() => onChange(!value), [onChange, value]);

  return (
    <Wrapper active value={value} {...props}>
      <input
        role="checkbox"
        type="checkbox"
        checked={value}
        onChange={onChangeCallback}
        {...props}
      />
    </Wrapper>
  );
};

export default FormFieldTickbox;
