import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import { FormFieldDate, FormFieldDateInline } from './date';
import { mockTime } from '~client/test-utils/mock-time';

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

    act(() => {
      fireEvent.change(input, { target: { value: '2014-04-09' } });
    });

    expect(props.onChange).toHaveBeenCalledWith(new Date('2014-04-09'));

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('should accept an empty string as an input value', () => {
    // this is because the browser allows resetting the input
    expect.assertions(3);
    const clock = sinon.useFakeTimers(new Date('2020-04-20'));

    const { getByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = getByDisplayValue('2017-11-10') as HTMLInputElement;

    act(() => {
      fireEvent.change(input, { target: { value: '' } });
    });

    expect(props.onChange).toHaveBeenCalledWith(new Date('2020-04-20'));

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('2020-04-20');

    clock.restore();
  });

  describe('when rendering inline', () => {
    const now = new Date('2019-07-06T16:47:20Z');
    const mockedTime = mockTime(now);
    beforeAll(mockedTime.setup);
    afterAll(mockedTime.teardown);

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

      act(() => {
        fireEvent.change(input, { target: { value: '' } });
      });

      expect(input.value).toBe('');

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('10/11/2017');
    });

    const testInput = (input: HTMLInputElement, value: string): void => {
      const chars = value.split('');
      chars.forEach((_, index): void => {
        const valueToIndex = value.substring(0, index + 1);
        act(() => {
          fireEvent.change(input, { target: { value: valueToIndex } });
        });
        act(() => {
          expect(input.value).toBe(valueToIndex);
        });
      });
    };

    it('should set dates based on a single number', () => {
      expect.assertions(4);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;
      testInput(input, '1');

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2019-07-01'));
    });

    it('should set dates based on a date and month', () => {
      expect.assertions(6);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;
      testInput(input, '4/3');

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2019-03-04'));
    });

    it('should set dates based on a date, month and year', () => {
      expect.assertions(10);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;
      testInput(input, '29/1/21');

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2021-01-29'));
    });

    it('should set the end of a month when the month length is longer than the current month', () => {
      expect.assertions(6);

      mockedTime.clock.setSystemTime(new Date('2020-06-10')); // June has 30 days

      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      testInput(input, '31/5');
      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2020-05-31'));

      mockedTime.clock.setSystemTime(now);
    });

    it('should set dates based on an abbreviated full date', () => {
      expect.assertions(9);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;
      testInput(input, '2/9/16');

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2016-09-02'));
    });

    it('should set dates based on a full date with full year', () => {
      expect.assertions(11);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;
      testInput(input, '2/9/2016');

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(input);
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2016-09-02'));
    });

    it('should not call onChange with an invalid value', () => {
      expect.assertions(4);
      const { getByDisplayValue } = render(<FormFieldDateInline {...props} />);
      const input = getByDisplayValue('10/11/2017') as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: 'not-a-date' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('not-a-date');

      act(() => {
        fireEvent.blur(input);
      });

      expect(input.value).toBe('10/11/2017');
      expect(props.onChange).not.toHaveBeenCalled();
    });
  });
});
