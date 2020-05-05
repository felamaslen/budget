import React from 'react';

import { Wrapper, WrapperProps } from '.';

type Props = WrapperProps<string | undefined> & {
  onChange: (color: string) => void;
};

const FormFieldColor: React.FC<Props> = ({ value, onChange }) => (
  <Wrapper item="color" value={value} active={true}>
    <input
      type="color"
      value={value}
      onChange={({ target: { value: newValue } }): void => onChange(newValue)}
    />
  </Wrapper>
);

export default FormFieldColor;
