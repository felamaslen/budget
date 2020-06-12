import { render, RenderResult } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import getStore, { MockStore } from 'redux-mock-store';

import { PageAnalysis } from '.';
import { analysisRequested } from '~client/actions';
import { Period, Grouping } from '~client/constants/analysis';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';

describe('<PageAnalysis />', () => {
  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(async () => {
    matchMedia.clear();
  });

  const mockStore = getStore();

  const getContainer = (
    customProps = {},
    customState: (state: State) => State = (state): State => state,
  ): RenderResult & { store: MockStore } => {
    const state = customState({
      ...testState,
    });

    const store = mockStore(state);

    const utils = render(
      <Provider store={store}>
        <PageAnalysis {...customProps} />
      </Provider>,
    );

    return { store, ...utils };
  };

  it('should request data on mount', () => {
    expect.assertions(1);
    const { store } = getContainer();
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        analysisRequested({ period: Period.year, grouping: Grouping.category, page: 0 }),
      ]),
    );
  });

  it('should not render a timeline if there is not one present', () => {
    expect.assertions(1);
    const { container } = getContainer({}, (state) => ({
      ...state,
      analysis: {
        ...state.analysis,
        timeline: null,
      },
    }));

    expect(container.childNodes[0].childNodes).toHaveLength(2);
  });

  it("should not render anything if the page hasn't loaded", () => {
    expect.assertions(1);
    const { container } = getContainer({}, (state) => ({
      ...state,
      analysis: {
        ...state.analysis,
        cost: [],
        saved: 0,
      },
    }));

    expect(container).not.toHaveTextContent('NaN');
  });
});