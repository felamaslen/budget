/* eslint-disable jest/prefer-expect-assertions */
import { render, act, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';

import { AddReceipt, Props } from '.';
import { listItemCreated } from '~client/actions';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { testApiKey, nockSearchReceipt, nockSearchReceiptItem } from '~client/test-utils/nocks';
import { Page } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-short-id',
}));

describe('<AddReceipt />', () => {
  const props: Props = {
    setAddingReceipt: jest.fn(),
  };

  type RenderWithStore = RenderResult & { store: MockStore };

  const setup = (): RenderWithStore => {
    const store = createStore<State>()({
      ...testState,
      api: {
        ...testState.api,
        key: testApiKey,
      },
    });

    const renderResult = render(
      <Provider store={store}>
        <AddReceipt {...props} />
      </Provider>,
    );

    return { ...renderResult, store };
  };

  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  beforeEach(() => {
    nockSearchReceipt('Some%20food%20item,Other%20general%20item', [
      {
        item: 'Some food item',
        page: Page.food,
        category: 'Fruit',
      },
    ]);

    nockSearchReceiptItem('Some%20food%20item');
    nockSearchReceiptItem('Other%20general%20item');
  });
  afterEach(() => {
    matchMedia.clear();
  });

  it.each`
    item      | label     | type
    ${'date'} | ${'Date'} | ${'text'}
    ${'shop'} | ${'Shop'} | ${'text'}
  `('should render an input field for the $item', ({ label, type }) => {
    expect.assertions(2);
    const { getByLabelText } = setup();

    const input = getByLabelText(label) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe(type);
  });

  describe('when entering receipt information', () => {
    const setDate = (result: RenderWithStore, date: string): void => {
      const inputDate = result.getByLabelText('Date');
      act(() => {
        fireEvent.change(inputDate, { target: { value: date } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
    };

    const setShop = (result: RenderWithStore, shop: string): void => {
      const inputShop = result.getByLabelText('Shop');
      act(() => {
        fireEvent.change(inputShop, { target: { value: shop } });
      });
      act(() => {
        fireEvent.blur(inputShop);
      });
    };

    const addItem = (
      result: RenderWithStore,
      item: string,
      cost: string,
      page?: string,
      category?: string,
    ): void => {
      const inputsPage = result.getAllByDisplayValue('Food');
      const inputsItem = result.getAllByPlaceholderText('Item');
      const inputsCategory = result.getAllByPlaceholderText('Category');
      const inputsCost = result.getAllByDisplayValue('0.00');

      const inputPage = inputsPage[inputsPage.length - 1];
      const inputItem = inputsItem[inputsItem.length - 1];
      const inputCategory = inputsCategory[inputsCategory.length - 1];
      const inputCost = inputsCost[inputsCost.length - 1];

      act(() => {
        fireEvent.change(inputItem, { target: { value: item } });
        fireEvent.blur(inputItem);

        fireEvent.change(inputCost, { target: { value: cost } });
        fireEvent.blur(inputCost);

        if (page) {
          fireEvent.change(inputPage, { target: { value: page } });
        }
        if (category) {
          fireEvent.change(inputCategory, { target: { value: category } });
          fireEvent.blur(inputCategory);
        }
      });
    };

    const enterReceipt = async (): Promise<RenderWithStore> => {
      const result = setup();

      setDate(result, '20/4/20');

      addItem(result, 'Some food item', '1.23');

      const buttonAdd = result.getByText('+') as HTMLButtonElement;
      await waitFor(() => {
        expect(buttonAdd.disabled).toBe(false);
      });
      act(() => {
        fireEvent.click(buttonAdd);
      });

      addItem(result, 'Some general item', '4.56', 'General', 'Some general category');

      setShop(result, "Sainsbury's");

      const inputGeneralItem = result.getByDisplayValue('Some general item');

      act(() => {
        fireEvent.change(inputGeneralItem, { target: { value: 'Other general item' } });
        fireEvent.blur(inputGeneralItem);
      });

      const inputComplete = result.getByText('Autocomplete') as HTMLButtonElement;
      act(() => {
        fireEvent.click(inputComplete);
      });

      await waitFor(() => {
        expect(result.getByText('Finish')).toBeInTheDocument();
      });

      const inputFinish = result.getByText('Finish') as HTMLButtonElement;
      await waitFor(() => {
        expect(inputFinish.disabled).toBe(false);
      });
      act(() => {
        fireEvent.click(inputFinish);
      });

      await waitFor(() => {
        expect(result.store.getActions().length).toBeGreaterThan(0);
      });

      return result;
    };

    const action1 = listItemCreated(Page.food)({
      date: new Date('2020-04-20'),
      item: 'Some food item',
      category: 'Fruit', // from search results
      cost: 123,
      shop: "Sainsbury's",
    });

    const action2 = listItemCreated(Page.general)({
      date: new Date('2020-04-20'),
      item: 'Other general item',
      category: 'Some general category', // from manual input
      cost: 456,
      shop: "Sainsbury's",
    });

    it.each`
      description      | action
      ${'first item'}  | ${action1}
      ${'second item'} | ${action2}
    `('should dispatch an action for the $description', async ({ action }) => {
      const { store } = await enterReceipt();
      expect(store.getActions()).toStrictEqual(expect.arrayContaining([action]));
    });

    it('should not dispatch any other actions', async () => {
      const { store } = await enterReceipt();
      expect(store.getActions()).toHaveLength(2);
    });

    it('should clear all inputs', async () => {
      const { queryAllByPlaceholderText, queryAllByDisplayValue } = await enterReceipt();

      const inputsItem = queryAllByPlaceholderText('Item');
      const inputsCategory = queryAllByPlaceholderText('Category');
      const inputsPage = queryAllByDisplayValue('Food');
      const inputsCost = queryAllByDisplayValue('0.00');

      expect(inputsItem).toHaveLength(1);
      expect(inputsCategory).toHaveLength(1);
      expect(inputsPage).toHaveLength(1);
      expect(inputsCost).toHaveLength(1);
    });

    it('should indicate the total cost', () => {
      const result = setup();
      addItem(result, 'Some food item', '1.23');
      act(() => {
        fireEvent.click(result.getByText('+'));
      });
      addItem(result, 'Other general item', '4.56');

      expect(result.getByText('Total: £5.79')).toBeInTheDocument();
    });
  });

  describe('when autocompleting an item field', () => {
    it('should make the case consistent', async () => {
      nockSearchReceiptItem('cri', 'Crisps');
      const { getAllByPlaceholderText, getByText } = setup();
      const inputItem = getAllByPlaceholderText('Item')[0] as HTMLInputElement;

      act(() => {
        fireEvent.change(inputItem, { target: { value: 'cri' } });
      });

      await waitFor(() => {
        expect(getByText('Crisps')).toBeInTheDocument();
        expect(inputItem.value).toBe('Cri');
      });

      act(() => {
        fireEvent.blur(inputItem);
      });

      expect(inputItem.value).toBe('Cri');
    });
  });
});
