import deepEqual from 'fast-deep-equal';
import React, { useMemo, useCallback, useEffect } from 'react';

import { Wrapper } from './shared';

export type SelectOptions<V = string> = {
  internal: V;
  external?: string;
}[];

type Props<V> = {
  item?: string;
  options: SelectOptions<V>;
  value: V;
  onChange: (value: V) => void;
};
export { Props as PropsSelect };

export const FormFieldSelect: <V = string>(
  props: React.PropsWithChildren<Props<V>>,
) => React.ReactElement<Props<V>> = ({ item = '', options, value, onChange, ...props }) => {
  useEffect(() => {
    if (options.length && !options.some(({ internal }) => deepEqual(internal, value))) {
      onChange(options[0].internal);
    }
  }, [onChange, options, value]);

  const externalValue = useMemo(() => {
    const activeOption = options.find(({ internal }) => deepEqual(internal, value));
    return activeOption?.external ?? String(activeOption?.internal);
  }, [options, value]);

  const onChangeCallback = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const option = options.find(
        ({ internal, external = internal }) => external === event.target.value,
      );
      if (option) {
        onChange(option.internal);
      }
    },
    [onChange, options],
  );

  return (
    <Wrapper item={item} {...props}>
      <select
        value={externalValue}
        onBlur={onChangeCallback}
        onChange={onChangeCallback}
        {...props}
      >
        {options.map(({ internal, external = String(internal) }) => (
          <option key={external} value={external}>
            {external}
          </option>
        ))}
      </select>
    </Wrapper>
  );
};
