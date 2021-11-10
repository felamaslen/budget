import { useCallback } from 'react';

import { Wrapper, WrapperProps } from './shared';

type Props = WrapperProps & {
  id?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export const FormFieldTickbox: React.FC<Props> = ({ id, value, onChange, ...props }) => {
  const onChangeCallback = useCallback(() => onChange(!value), [onChange, value]);

  return (
    <Wrapper {...props}>
      <input
        id={id}
        data-testid="checkbox"
        type="checkbox"
        checked={value}
        onChange={onChangeCallback}
        {...props}
      />
    </Wrapper>
  );
};
