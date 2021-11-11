import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Props, Upper } from './upper';

import { AnalysisPeriod, AnalysisGroupBy } from '~client/types/enum';

describe('pageAnalysis / <Upper />', () => {
  const onRequest = jest.fn();
  const onOpenSankey = jest.fn();

  const props: Props = {
    period: AnalysisPeriod.Year,
    groupBy: AnalysisGroupBy.Category,
    page: 0,
    description: 'foo',
    loading: false,
    onRequest,
    onOpenSankey,
  };

  describe('period switcher', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<Upper {...props} />);
      expect(getByText('Period:')).toBeInTheDocument();
    });

    describe.each`
      group      | period
      ${'month'} | ${AnalysisPeriod.Month}
      ${'week'}  | ${AnalysisPeriod.Week}
    `('when the selected period is $group', ({ period }: { period: AnalysisPeriod }) => {
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
          userEvent.click(radio);

          expect(onRequest).not.toHaveBeenCalled();
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
          userEvent.click(radio);

          expect(onRequest).toHaveBeenCalledTimes(1);
          expect(onRequest).toHaveBeenCalledWith({ period });
        });
      }
    });
  });

  describe('groupBy switcher', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<Upper {...props} />);
      expect(getByText('Group by:')).toBeInTheDocument();
    });

    describe.each`
      group         | groupBy
      ${'category'} | ${AnalysisGroupBy.Category}
      ${'shop'}     | ${AnalysisGroupBy.Shop}
    `('when the selected group is $group', ({ groupBy }: { groupBy: AnalysisGroupBy }) => {
      it('should render the group name', () => {
        expect.assertions(1);
        const { getByText } = render(<Upper {...props} />);
        expect(getByText(groupBy)).toBeInTheDocument();
      });
      it('should render a radio button', () => {
        expect.assertions(1);
        const { getByTestId } = render(<Upper {...props} />);
        const radio = getByTestId(`input-groupby-${groupBy}`) as HTMLInputElement;
        expect(radio).toBeInTheDocument();
      });

      if (groupBy === props.groupBy) {
        it('should be checked', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-groupby-${groupBy}`) as HTMLInputElement;
          expect(radio.checked).toBe(true);
        });

        it('should not change the groupBy on click', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-groupby-${groupBy}`) as HTMLInputElement;
          userEvent.click(radio);

          expect(onRequest).not.toHaveBeenCalled();
        });
      } else {
        it('should not be checked', () => {
          expect.assertions(1);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-groupby-${groupBy}`) as HTMLInputElement;
          expect(radio.checked).toBe(false);
        });

        it('should change the groupBy on click', () => {
          expect.assertions(2);
          const { getByTestId } = render(<Upper {...props} />);
          const radio = getByTestId(`input-groupby-${groupBy}`) as HTMLInputElement;
          userEvent.click(radio);

          expect(onRequest).toHaveBeenCalledTimes(1);
          expect(onRequest).toHaveBeenCalledWith({ groupBy });
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

    userEvent.click(previous);

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledWith({ page: 2 });

    onRequest.mockClear();

    userEvent.click(next);

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledWith({ page: 0 });
  });

  it('should render a description', () => {
    expect.assertions(1);
    const { getByText } = render(<Upper {...props} />);
    expect(getByText('foo')).toBeInTheDocument();
  });
});
