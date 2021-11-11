import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';

import { GraphBalance, Props } from '.';
import { ResizeContext, TodayProvider } from '~client/hooks';
import { getOverviewGraphValues } from '~client/selectors';
import { testNow, testState as state } from '~client/test-data/state';
import { renderVisualTest } from '~client/test-utils';

describe('<GraphBalance />', () => {
  let randomSpy: jest.SpyInstance;

  const today = endOfDay(testNow);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(testNow);
    let randomIndex = 0;
    randomSpy = jest.spyOn(Math, 'random').mockImplementation((): number => {
      randomIndex += 1;
      return randomIndex % 2 === 0 ? 0.32 : 0.81;
    });
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  const setup = (): RenderResult => {
    const graph = getOverviewGraphValues(today, 0)(state);
    const props: Props = {
      isMobile: false,
      showAll: false,
      setShowAll: jest.fn(),
      setMobileGraph: jest.fn(),
      isLoading: false,
      graph,
      longTermOptions: { enabled: false, rates: {} },
      setLongTermOptions: jest.fn(),
      defaultRates: { years: 30, income: 488500, stockPurchase: 255000, xirr: 0.18 },
    };

    return render(
      <TodayProvider>
        <ResizeContext.Provider value={894}>
          <GraphBalance {...props} />
        </ResizeContext.Provider>
      </TodayProvider>,
    );
  };

  it('should render a graph', async () => {
    expect.assertions(1);
    setup();
    const screenshot = await renderVisualTest();
    expect(screenshot).toMatchImageSnapshot();
  });
});
