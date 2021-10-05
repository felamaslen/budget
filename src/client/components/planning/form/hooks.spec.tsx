import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { useTransactionFormElements } from './hooks';

describe(useTransactionFormElements.name, () => {
  const onChange = jest.fn();

  beforeEach(jest.clearAllMocks);

  const TestComponent: React.FC = () => {
    const { name, value } = useTransactionFormElements(onChange);
    return (
      <>
        {name}
        {value}
      </>
    );
  };

  it('should call onChange when pressing enter', async () => {
    expect.assertions(3);
    const { getAllByRole } = render(<TestComponent />);

    const [nameInput, valueInput] = getAllByRole('textbox') as HTMLInputElement[];

    act(() => {
      fireEvent.change(nameInput, { target: { value: 'My name' } });
    });

    act(() => {
      fireEvent.change(valueInput, { target: { value: '-452.39' } });
    });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.keyDown(nameInput, { key: 'Enter' });
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      name: 'My name',
      value: -45239,
      formula: undefined,
    });
  });

  describe.each`
    case               | name         | value
    ${'name is empty'} | ${''}        | ${'1.23'}
    ${'value is zero'} | ${'my name'} | ${'0.00'}
  `('when $case', (inputs: { name: string; value: string }) => {
    it('should not call onChange', () => {
      expect.assertions(1);

      const { getAllByRole } = render(<TestComponent />);

      const [nameInput, valueInput] = getAllByRole('textbox') as HTMLInputElement[];

      act(() => {
        fireEvent.change(nameInput, { target: { value: inputs.name } });
      });

      act(() => {
        fireEvent.change(valueInput, { target: { value: inputs.value } });
      });

      act(() => {
        fireEvent.keyDown(nameInput, { key: 'Enter' });
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
