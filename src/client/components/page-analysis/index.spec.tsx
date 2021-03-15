import { render, RenderResult } from '@testing-library/react';
import type { DocumentNode } from 'graphql';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import createMockStore from 'redux-mock-store';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { PageAnalysis } from '.';

import * as AnalysisQueries from '~client/gql/queries/analysis';
import { ResizeContext } from '~client/hooks';
import { testState } from '~client/test-data';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { AnalysisGroupBy, AnalysisPage, AnalysisPeriod } from '~client/types/enum';
import type { AnalysisQuery } from '~client/types/gql';

describe('<PageAnalysis />', () => {
  type Overrides = Partial<AnalysisQuery['analysis']>;

  const getMockClient = (overrides: Overrides = {}): Client =>
    (({
      executeQuery: ({ query }: { variables: Record<string, unknown>; query: DocumentNode }) => {
        if (query === AnalysisQueries.Analysis) {
          return fromValue({
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
                timeline: [[1, 2, 3]],
                ...overrides,
              },
            },
          });
        }

        return fromValue({
          data: null,
        });
      },
    } as unknown) as Client);

  let matchMedia: MatchMediaMock;
  let querySpy: jest.SpyInstance;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(async () => {
    matchMedia.clear();
    querySpy?.mockRestore();
  });

  const setup = (overrides: Overrides = {}): RenderResult => {
    const mockClient = getMockClient(overrides);
    querySpy = jest.spyOn(mockClient, 'executeQuery');

    return render(
      <GQLProviderMock client={mockClient}>
        <ResizeContext.Provider value={854}>
          <Provider store={createMockStore()(testState)}>
            <MemoryRouter initialEntries={['/analysis']}>
              <Route path="/analysis/:groupBy?/:period?/:page?" component={PageAnalysis} />
            </MemoryRouter>
          </Provider>
        </ResizeContext.Provider>
      </GQLProviderMock>,
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

  it('should not render a timeline if there is not one present', () => {
    expect.assertions(1);
    const { container } = setup({ timeline: null });

    expect(container.childNodes[0].childNodes).toHaveLength(2);
  });

  describe('when the cost forest is empty', () => {
    it('should not render anything', () => {
      expect.assertions(1);
      const { container } = setup({ cost: [], income: 0 });

      expect(container).not.toHaveTextContent('NaN');
    });
  });
});
