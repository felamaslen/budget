import { Wrapper, WrapperProps } from './shared';

type Props = WrapperProps & {
  value: string;
  onChange: (color: string) => void;
};

export const FormFieldColor: React.FC<Props> = ({ value, onChange }) => (
  <Wrapper item="color">
    <input
      type="color"
      value={value}
      onChange={({ target: { value: newValue } }): void => onChange(newValue)}
    />
  </Wrapper>
);
