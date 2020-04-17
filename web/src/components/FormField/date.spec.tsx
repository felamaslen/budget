import sinon from 'sinon';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import isValid from 'date-fns/isValid';

import FormFieldDate from './date';

describe('<FormFieldDate />', () => {
  const props = {
    active: true,
    value: new Date('2017-11-10'),
    onChange: jest.fn(),
  };

  it('should render an input with the value', async () => {
    const { findByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = (await findByDisplayValue('2017-11-10')) as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('date');
  });

  it('should call onChange when changing the value, after the blur', async () => {
    const { findByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = await findByDisplayValue('2017-11-10');

    act(() => {
      fireEvent.change(input, { target: { value: '2014-04-09' } });
    });
    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith(new Date('2014-04-09'));
  });

  it('should not handle bad values', async () => {
    // This should never happen in practice, as the "date" input type
    // should always fire an event with a valid date string
    const { findByDisplayValue } = render(<FormFieldDate {...props} />);
    const input = await findByDisplayValue('2017-11-10');

    act(() => {
      fireEvent.change(input, { target: { value: 'not-a-date' } });
    });
    expect(props.onChange).not.toHaveBeenCalled();

    act(() => {
      fireEvent.blur(input);
    });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange.mock.calls[0][0] instanceof Date).toBe(true);
    expect(isValid(props.onChange.mock.calls[0][0])).toBe(false);
  });

  describe('when rendering inline', () => {
    let clock: sinon.SinonFakeTimers;
    const now = new Date('2019-07-06T16:47:20Z');
    beforeAll(() => {
      clock = sinon.useFakeTimers(now);
    });

    afterAll(() => {
      clock.restore();
    });

    it('should render as a text input with localised value', async () => {
      const { findByDisplayValue } = render(<FormFieldDate {...props} inline />);
      const input = (await findByDisplayValue('10/11/2017')) as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should set dates based on a single number', async () => {
      const { findByDisplayValue, container } = render(<FormFieldDate {...props} inline />);
      const input = (await findByDisplayValue('10/11/2017')) as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: '1' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldDate {...props} inline active={false} />, { container });
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2019-07-01'));
    });

    it('should set dates based on a date and month', async () => {
      const { findByDisplayValue, container } = render(<FormFieldDate {...props} inline />);
      const input = (await findByDisplayValue('10/11/2017')) as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: '4/3' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldDate {...props} inline active={false} />, { container });
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2019-03-04'));
    });

    it('should set dates based on an abbreviated full date', async () => {
      const { findByDisplayValue, container } = render(<FormFieldDate {...props} inline />);
      const input = (await findByDisplayValue('10/11/2017')) as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: '2/9/16' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldDate {...props} inline active={false} />, { container });
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2016-09-02'));
    });

    it('should set dates based on a full date with full year', async () => {
      const { findByDisplayValue, container } = render(<FormFieldDate {...props} inline />);
      const input = (await findByDisplayValue('10/11/2017')) as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: '2/9/2016' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldDate {...props} inline active={false} />, { container });
      });

      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(new Date('2016-09-02'));
    });

    it('should not call onChange with an invalid value', async () => {
      const { findByDisplayValue, container } = render(<FormFieldDate {...props} inline />);
      const input = (await findByDisplayValue('10/11/2017')) as HTMLInputElement;

      act(() => {
        fireEvent.change(input, { target: { value: 'not-a-date' } });
      });

      expect(props.onChange).not.toHaveBeenCalled();

      act(() => {
        render(<FormFieldDate {...props} inline active={false} />, { container });
      });

      expect(props.onChange).not.toHaveBeenCalled();
    });
  });
});
