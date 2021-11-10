import { render, RenderResult } from '@testing-library/react';
import endOfDay from 'date-fns/endOfDay';

import { GraphSpending, Props } from '.';
import { ResizeContext, TodayProvider } from '~client/hooks';
import { getOverviewGraphValues } from '~client/selectors';
import { testNow, testState as state } from '~client/test-data/state';
import { renderVisualTest } from '~client/test-utils';

describe('<GraphSpending />', () => {
  const today = endOfDay(testNow);
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  const setup = (): RenderResult => {
    const graph = getOverviewGraphValues(today, 0)(state);
    const props: Props = {
      isMobile: false,
      showAll: false,
      setShowAll: jest.fn(),
      longTerm: false,
      investments: Array(graph.values.income.length).fill(0),
      graph,
      initialCumulativeValues: { spending: 0, income: 0 },
      setMobileGraph: jest.fn(),
    };

    return render(
      <TodayProvider>
        <ResizeContext.Provider value={1032}>
          <GraphSpending {...props} />
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
