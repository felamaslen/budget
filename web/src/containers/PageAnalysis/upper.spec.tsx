import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Upper from './upper';
import { Period, Grouping } from '~client/constants/analysis';

describe('PageAnalysis / <Upper />', () => {
  const props = {
    period: Period.year,
    grouping: Grouping.category,
    page: 0,
    description: 'foo',
    onRequest: jest.fn(),
  };

  describe('period switcher', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<Upper {...props} />);
      expect(getByText('Period:')).toBeInTheDocument();
    });

    describe.each([[Period.month], [Period.month], [Period.week]])('%s group', (period: Period) => {
      it('should render the group name', () => {
        expect.assertions(1);
        const { getByText } = render(<Upper {...props} />);
        expect(getByText(period)).toBeInTheDocument();
      });
      it('should render a radio button', () => {
        expect.assertions(1);
        const { getByTestId } = render(<Upper {...props} />);
        const radio = getByTestId(`input-period-${period}`) as HTMLInputElement;
        expect(radio).toBeInTheDocument();
      });

      if (period === props.period) {
        it('should be checked', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-period-${period}`) as HTMLInputElement;
          expect(radio.checked).toBe(true);
        });

        it('should not change the period on click', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-period-${period}`) as HTMLInputElement;
          act(() => {
            fireEvent.click(radio);
          });

          expect(props.onRequest).not.toHaveBeenCalled();
        });
      } else {
        it('should not be checked', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-period-${period}`) as HTMLInputElement;
          expect(radio.checked).toBe(false);
        });

        it('should change the period on click', () => {
          expect.assertions(2);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-period-${period}`) as HTMLInputElement;
          act(() => {
            fireEvent.click(radio);
          });

          expect(props.onRequest).toHaveBeenCalledTimes(1);
          expect(props.onRequest).toHaveBeenCalledWith({ period });
        });
      }
    });
  });

  describe('grouping switcher', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<Upper {...props} />);
      expect(getByText('Grouping:')).toBeInTheDocument();
    });

    describe.each([[Grouping.category], [Grouping.shop]])('%s group', (grouping: Grouping) => {
      it('should render the group name', () => {
        expect.assertions(1);
        const { getByText } = render(<Upper {...props} />);
        expect(getByText(grouping)).toBeInTheDocument();
      });
      it('should render a radio button', () => {
        expect.assertions(1);
        const { getByTestId } = render(<Upper {...props} />);
        const radio = getByTestId(`input-grouping-${grouping}`) as HTMLInputElement;
        expect(radio).toBeInTheDocument();
      });

      if (grouping === props.grouping) {
        it('should be checked', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-grouping-${grouping}`) as HTMLInputElement;
          expect(radio.checked).toBe(true);
        });

        it('should not change the grouping on click', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-grouping-${grouping}`) as HTMLInputElement;
          act(() => {
            fireEvent.click(radio);
          });

          expect(props.onRequest).not.toHaveBeenCalled();
        });
      } else {
        it('should not be checked', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-grouping-${grouping}`) as HTMLInputElement;
          expect(radio.checked).toBe(false);
        });

        it('should change the grouping on click', () => {
          expect.assertions(2);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-grouping-${grouping}`) as HTMLInputElement;
          act(() => {
            fireEvent.click(radio);
          });

          expect(props.onRequest).toHaveBeenCalledTimes(1);
          expect(props.onRequest).toHaveBeenCalledWith({ grouping });
        });
      }
    });
  });

  it('should render buttons', () => {
    expect.assertions(4);
    const { getByText } = render(<Upper {...props} />);

    const previous = getByText('Previous') as HTMLButtonElement;
    const next = getByText('Next') as HTMLButtonElement;

    expect(previous).toBeInTheDocument();
    expect(next).toBeInTheDocument();

    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(true);
  });

  it('should call functions when the buttons are pressed', () => {
    expect.assertions(4);
    const { getByText } = render(<Upper {...props} page={1} />);

    const previous = getByText('Previous') as HTMLButtonElement;
    const next = getByText('Next') as HTMLButtonElement;

    act(() => {
      fireEvent.click(previous);
    });

    expect(props.onRequest).toHaveBeenCalledTimes(1);
    expect(props.onRequest).toHaveBeenCalledWith({ page: 2 });

    props.onRequest.mockClear();

    act(() => {
      fireEvent.click(next);
    });

    expect(props.onRequest).toHaveBeenCalledTimes(1);
    expect(props.onRequest).toHaveBeenCalledWith({ page: 0 });
  });

  it('should render a description', () => {
    expect.assertions(1);
    const { getByText } = render(<Upper {...props} />);
    expect(getByText('foo')).toBeInTheDocument();
  });
});
