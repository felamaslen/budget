import { render, RenderResult } from '@testing-library/react';
import getStore, { MockStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import React from 'react';

import PageAnalysis from '.';
import { testState } from '~client/test-data/state';
import { State } from '~client/reducers';
import { requested } from '~client/actions/analysis';

describe('<PageAnalysis />', () => {
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
    expect(store.getActions()).toStrictEqual(expect.arrayContaining([requested({})]));
  });

  it('should not render a timeline if there is not one present', () => {
    expect.assertions(1);
    const { container } = getContainer({}, state => ({
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
    const { container } = getContainer({}, state => ({
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
