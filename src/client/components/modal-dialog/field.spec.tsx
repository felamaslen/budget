import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import React from 'react';
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

    act(() => {
      fireEvent.change(input, { target: { value: 'hello' } });
    });

    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledWith('item', 'hello');
  });
});
