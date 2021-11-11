import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalDialogField, makeField } from './field';
import { FormFieldText } from '~client/components/form-field';

describe('<ModalDialogField />', () => {
  const props = {
    id: 'some-field-id',
    field: 'item' as const,
    Field: makeField('item', FormFieldText),
    value: 'bar',
    invalid: false,
    onChange: jest.fn(),
  };

  const setup = (customProps = {}): RenderResult =>
    render(<ModalDialogField {...props} {...customProps} />);

  it('should render a label', () => {
    expect.assertions(2);
    const { getByText } = setup();
    const label = getByText('item') as HTMLLabelElement;
    expect(label).toBeInTheDocument();
    expect(label.htmlFor).toBe('some-field-id');
  });

  it('should render an input', () => {
    expect.assertions(1);
    const { getByDisplayValue } = setup();
    const input = getByDisplayValue('bar');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when blurring the field', () => {
    expect.assertions(2);
    const { getByDisplayValue } = setup();
    const input = getByDisplayValue('bar');

    userEvent.clear(input);
    userEvent.type(input, 'hello');

    expect(props.onChange).not.toHaveBeenCalled();

    userEvent.tab();

    expect(props.onChange).toHaveBeenCalledWith('item', 'hello');
  });
});
