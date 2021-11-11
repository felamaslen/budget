import { useYear, useYearOptions } from './years';
import { TodayProvider } from '~client/hooks';
import { testState } from '~client/test-data';
import { renderHookWithStore } from '~client/test-utils';

describe('planning year hooks', () => {
  const Wrapper: React.FC = ({ children }) => <TodayProvider>{children}</TodayProvider>;

  const customState: Partial<typeof testState> = {
    overview: {
      ...testState.overview,
      startDate: new Date('2017-03-01'), // FY16/17
    },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-05-11')); // FY 20/21
  });

  describe(useYearOptions.name, () => {
    it('should give a range of financial years from the start date to five years in the future', () => {
      expect.assertions(1);

      const { result } = renderHookWithStore(useYearOptions, {
        renderHookOptions: { wrapper: Wrapper },
        customState,
      });

      expect(result.current).toStrictEqual<number[]>([
        2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
      ]);
    });
  });

  describe(useYear.name, () => {
    it('should return the current financial year initially', () => {
      expect.assertions(1);
      const { result } = renderHookWithStore<{ year: string | undefined }, number>(
        (props) => useYear(props.year),
        {
          renderHookOptions: { initialProps: { year: undefined }, wrapper: Wrapper },
          customState,
        },
      );

      expect(result.current).toBe(2020);
    });

    it('should return the given year, within the bounds of the options', () => {
      expect.assertions(3);
      const { rerender, result } = renderHookWithStore<{ year: string | undefined }, number>(
        (props) => useYear(props.year),
        {
          renderHookOptions: { initialProps: { year: undefined }, wrapper: Wrapper },
          customState,
        },
      );

      rerender({ year: '2018' });
      expect(result.current).toBe(2018);

      rerender({ year: '2015' });
      expect(result.current).toBe(2016);

      rerender({ year: '2026' });
      expect(result.current).toBe(2025);
    });
  });
});
