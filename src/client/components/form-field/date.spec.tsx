import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { FormFieldDate, FormFieldDateInline } from './date';

describe('<FormFieldDate />', () => {
  const props = {
    active: true,
    value: new Date('2017-11-10'),
    onChange: jest.fn(),
  };

  it('should render an input with the value', () => {
    expect.assertions(2);
    const { getByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = getByDisplayValue('2017-11-10') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('date');
  });

  it('should call onChange when changing the value, without waiting for blur', () => {
    expect.assertions(2);
    const { getByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = getByDisplayValue('2017-11-10');

    userEvent.type(input, '2014-04-09');

    expect(props.onChange).toHaveBeenCalledWith(new Date('2014-04-09'));

    userEvent.tab();

    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('should accept an empty string as an input value', () => {
    // this is because the browser allows resetting the input
    expect.assertions(3);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-04-20'));

    const { getByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = getByDisplayValue('2017-11-10') as HTMLInputElement;

    userEvent.type(input, '{selectall}{backspace}');

    expect(props.onChange).toHaveBeenCalledWith(new Date('2020-04-20'));

    userEvent.tab();

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('2020-04-20');
  });

  describe('when rendering inline', () => {
    const now = new Date('2019-07-06T16:47:20Z');
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    it('should use the current date by default', () => {
      expect.assertions(1);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} value={undefined} />);
      expect(getByDisplayValue('06/07/2019')).toBeInTheDocument();
    });

    it('should render as a text input with localised value', () => {
      expect.assertions(2);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should accept an empty string as an input value', () => {
      expect.assertions(3);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      userEvent.type(input, '{selectall}{backspace}');

      expect(input.value).toBe('');

      userEvent.tab();

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('10/11/2017');
    });

    it.each`
      case                          | value         | expectedDate
      ${'single number'}            | ${'1'}        | ${new Date('2019-07-01')}
      ${'date and month'}           | ${'4/3'}      | ${new Date('2019-03-04')}
      ${'date, month and year'}     | ${'29/1/21'}  | ${new Date('2021-01-29')}
      ${'abbreviated full date'}    | ${'2/9/16'}   | ${new Date('2016-09-02')}
      ${'full date with full year'} | ${'2/9/2016'} | ${new Date('2016-09-02')}
    `('should set dates based on a $case', ({ value, expectedDate }) => {
      expect.assertions(3);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      userEvent.type(input, `{selectall}{backspace}${value}`);
      expect(props.onChange).not.toHaveBeenCalled();
      userEvent.tab();

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(expectedDate);
    });

    it('should set the end of a month when the month length is longer than the current month', () => {
      expect.assertions(2);

      jest.setSystemTime(new Date('2020-06-10')); // June has 30 days

      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      userEvent.type(input, '{selectall}{backspace}31/5');
      userEvent.tab();

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2020-05-31'));

      jest.setSystemTime(now);
    });

    it('should not call onChange with an invalid value', () => {
      expect.assertions(4);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      userEvent.type(input, '{selectall}{backspace}not-a-date');

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('not-a-date');

      userEvent.tab();

      expect(input.value).toBe('10/11/2017');
      expect(props.onChange).not.toHaveBeenCalled();
    });
  });
});
