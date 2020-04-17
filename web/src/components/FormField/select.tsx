import React, { useCallback, useEffect } from 'react';

import { Wrapper } from '.';

export type Props<V extends string> = {
  item?: string;
  options: {
    internal: V;
    external?: string;
  }[];
  value: V;
  onChange: (value: V) => void;
};

const FormFieldSelect: <V extends string = string>(
  props: React.PropsWithChildren<Props<V>>,
) => React.ReactElement<Props<V>> = ({ item = '', options, value, onChange, ...props }) => {
  const onChangeCallback = useCallback(event => onChange(event.target.value), [onChange]);

  useEffect(() => {
    if (options.length && !options.some(({ internal }) => internal === value)) {
      onChange(options[0].internal);
    }
  }, [onChange, options, value]);

  return (
    <Wrapper item={item} value={value} active {...props}>
      <select value={value} onChange={onChangeCallback} {...props}>
        {options.map(({ internal, external = internal }) => (
          <option key={internal} value={internal}>
            {external}
          </option>
        ))}
      </select>
    </Wrapper>
  );
};

export default FormFieldSelect;
