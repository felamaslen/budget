import React, { useCallback, useEffect } from 'react';

import { Wrapper } from './shared';

export type SelectOptions<V extends string = string> = {
  internal: V;
  external?: string;
}[];

type Props<V extends string> = {
  item?: string;
  options: SelectOptions<V>;
  value: V;
  onChange: (value: V) => void;
};
export { Props as PropsSelect };

export const FormFieldSelect: <V extends string = string>(
  props: React.PropsWithChildren<Props<V>>,
) => React.ReactElement<Props<V>> = ({ item = '', options, value, onChange, ...props }) => {
  const onChangeCallback = useCallback((event) => onChange(event.target.value), [onChange]);

  useEffect(() => {
    if (options.length && !options.some(({ internal }) => internal === value)) {
      onChange(options[0].internal);
    }
  }, [onChange, options, value]);

  return (
    <Wrapper item={item} {...props}>
      <select value={value} onBlur={onChangeCallback} onChange={onChangeCallback} {...props}>
        {options.map(({ internal, external = internal }) => (
          <option key={internal} value={internal}>
            {external}
          </option>
        ))}
      </select>
    </Wrapper>
  );
};
