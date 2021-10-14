import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { parseRawValue, useTransactionFormElements } from './hooks';

describe(parseRawValue.name, () => {
  it('should handle rounding errors in explicit values', () => {
    expect.assertions(1);
    expect(parseRawValue('-635.68')).toStrictEqual<ReturnType<typeof parseRawValue>>({
      value: -63568,
      formula: undefined,
    });
  });
});

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

    userEvent.type(nameInput, 'My name');
    userEvent.type(valueInput, '{selectall}{backspace}-452.39');

    expect(onChange).not.toHaveBeenCalled();

    userEvent.type(nameInput, '{enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      name: 'My name',
      value: -45239,
      formula: undefined,
    });
  });

  describe.each`
    case               | name                        | value
    ${'name is empty'} | ${'{selectall}{backspace}'} | ${'1.23'}
    ${'value is zero'} | ${'my name'}                | ${'0.00'}
  `('when $case', (inputs: { name: string; value: string }) => {
    it('should not call onChange', () => {
      expect.assertions(1);

      const { getAllByRole } = render(<TestComponent />);

      const [nameInput, valueInput] = getAllByRole('textbox') as HTMLInputElement[];

      userEvent.type(nameInput, inputs.name);
      userEvent.type(valueInput, `{selectall}{backspace}${inputs.value}`);
      userEvent.type(nameInput, '{enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
