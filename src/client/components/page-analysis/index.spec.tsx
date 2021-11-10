import MatchMediaMock from 'jest-matchmedia-mock';
import { MemoryRouter, Route } from 'react-router';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { PageAnalysis } from '.';

import * as AnalysisQueries from '~client/gql/queries/analysis';
import { ResizeContext } from '~client/hooks';
import { mockClient, renderWithStore } from '~client/test-utils';
import { AnalysisGroupBy, AnalysisPage, AnalysisPeriod } from '~client/types/enum';
import type { AnalysisQuery } from '~client/types/gql';

describe('<PageAnalysis />', () => {
  let matchMedia: MatchMediaMock;
  let querySpy: jest.SpyInstance;

  beforeEach(() => {
    querySpy = jest.spyOn(mockClient, 'executeQuery');
  });

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(async () => {
    matchMedia.clear();
    querySpy?.mockRestore();
  });

  const stubQueries = (overrides: Partial<AnalysisQuery['analysis']>): void => {
    jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (request.query === AnalysisQueries.Analysis) {
        return fromValue({
          operation: makeOperation('query', request, {} as OperationContext),
          data: {
            analysis: {
              description: 'Some description',
              saved: 67123,
              cost: [
                {
                  item: AnalysisPage.Food,
                  tree: [
                    { category: 'foo2_bar2', sum: 137650 },
                    { category: 'foo2_bar1', sum: 156842 },
                  ],
                },
              ],
              ...overrides,
            },
          },
        });
      }

      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });
  };

  const setup = (
    overrides: Partial<AnalysisQuery['analysis']> = {},
  ): ReturnType<typeof renderWithStore> => {
    stubQueries(overrides);

    return renderWithStore(
      <ResizeContext.Provider value={854}>
        <MemoryRouter initialEntries={['/analysis']}>
          <Route path="/analysis/:groupBy?/:period?/:page?" component={PageAnalysis} />
        </MemoryRouter>
      </ResizeContext.Provider>,
    );
  };

  it('should request data on mount', () => {
    expect.assertions(2);
    setup();
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: AnalysisQueries.Analysis,
        variables: expect.objectContaining({
          period: AnalysisPeriod.Year,
          groupBy: AnalysisGroupBy.Category,
          page: 0,
        }),
      }),
      expect.objectContaining({}),
    );
  });

  describe('when the cost forest is empty', () => {
    it('should not render anything', () => {
      expect.assertions(1);
      const { container } = setup({ cost: [] });

      expect(container).not.toHaveTextContent('NaN');
    });
  });
});
