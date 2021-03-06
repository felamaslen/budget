import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import { endOfDay } from 'date-fns';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore } from 'redux-mock-store';

import { CashRow } from './cash-row';
import { TodayContext } from '~client/hooks';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { State } from '~client/reducers';
import { testNow, testState } from '~client/test-data';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';

describe('<CashRow />', () => {
  const getStore = createMockStore<State>();

  const onCreate = jest.fn();
  const onUpdate = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.spyOn(listMutationHooks, 'useListCrudFunds').mockReturnValue({
      onCreate,
      onUpdate,
      onDelete,
    });
  });

  const setup = (): RenderResult & { store: MockStore<State> } => {
    const store = getStore(testState);
    const renderResult = render(
      <Provider store={store}>
        <GQLProviderMock>
          <TodayContext.Provider value={endOfDay(testNow)}>
            <CashRow />
          </TodayContext.Provider>
        </GQLProviderMock>
      </Provider>,
    );
    return { ...renderResult, store };
  };

  it('should render the cash value with target', () => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText('Cash')).toBeInTheDocument();
  });

  describe('when hovering over the cash value adjustment', () => {
    it('should render a preview box', () => {
      expect.assertions(4);
      const previewText = 'Buy £16k of stock to adjust';

      const { getByText, queryByText } = setup();

      expect(queryByText(previewText)).not.toBeInTheDocument();

      const cash = getByText('Cash') as HTMLDivElement;
      const adjustment = cash.nextSibling as HTMLDivElement;

      expect(adjustment).toBeInTheDocument();

      act(() => {
        fireEvent.mouseOver(adjustment);
      });

      expect(getByText(previewText)).toBeInTheDocument();

      act(() => {
        fireEvent.mouseOut(adjustment);
      });

      expect(queryByText(previewText)).not.toBeInTheDocument();
    });
  });
});
