import { render, act, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import type { DocumentNode } from 'graphql';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { AddReceipt, Props } from '.';
import * as ListMutations from '~client/gql/mutations/list';
import * as SearchQueries from '~client/gql/queries/search';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { ReceiptPage } from '~client/types/enum';
import type { QueryReceiptItemArgs, QueryReceiptItemsArgs } from '~client/types/gql';

jest.mock('shortid', () => ({
  generate: (): string => 'some-short-id',
}));

describe('<AddReceipt />', () => {
  const props: Props = {
    setAddingReceipt: jest.fn(),
  };

  const mockClient = ({
    executeQuery: ({
      variables,
      query,
    }: {
      variables: Record<string, unknown>;
      query: DocumentNode;
    }) => {
      if (
        query === SearchQueries.ReceiptItem &&
        (variables as QueryReceiptItemArgs).item === 'cri'
      ) {
        return fromValue({
          data: {
            receiptItem: 'Crisps',
          },
        });
      }
      if (
        query === SearchQueries.ReceiptItems &&
        (variables as QueryReceiptItemsArgs).items[0] === 'Some food item' &&
        (variables as QueryReceiptItemsArgs).items[1] === 'Other general item'
      ) {
        return fromValue({
          data: {
            receiptItems: [
              {
                item: 'Some food item',
                page: ReceiptPage.Food,
                category: 'Fruit',
              },
            ],
          },
        });
      }

      return fromValue({
        data: null,
      });
    },
    executeMutation: ({ query }: { variables: Record<string, unknown>; query: DocumentNode }) => {
      if (query === ListMutations.CreateReceipt) {
        return fromValue({
          data: {
            createReceipt: {
              error: null,
            },
          },
        });
      }
      return fromValue({
        data: null,
      });
    },
  } as unknown) as Client;

  const store = createMockStore()({});
  const setup = (): RenderResult =>
    render(
      <GQLProviderMock client={mockClient}>
        <Provider store={store}>
          <AddReceipt {...props} />
        </Provider>
      </GQLProviderMock>,
    );

  let mutateSpy: jest.SpyInstance;
  beforeEach(() => {
    mutateSpy = jest.spyOn(mockClient, 'executeMutation');
    jest.useFakeTimers();
  });

  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });

    matchMedia.clear();
    mutateSpy.mockRestore();
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
    const setDate = (result: RenderResult, date: string): void => {
      const inputDate = result.getByLabelText('Date');
      act(() => {
        fireEvent.change(inputDate, { target: { value: date } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
    };

    const setShop = (result: RenderResult, shop: string): void => {
      const inputShop = result.getByLabelText('Shop');
      act(() => {
        fireEvent.change(inputShop, { target: { value: shop } });
      });
      act(() => {
        fireEvent.blur(inputShop);
      });
    };

    const addItem = (
      result: RenderResult,
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

    const enterReceipt = async (): Promise<RenderResult> => {
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
        expect(mutateSpy).toHaveBeenCalledTimes(1);
      });

      return result;
    };

    it('should run a mutation to create a receipt', async () => {
      expect.hasAssertions();
      await enterReceipt();
      expect(mutateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          query: ListMutations.CreateReceipt,
          variables: expect.objectContaining({
            date: '2020-04-20',
            shop: "Sainsbury's",
            items: expect.arrayContaining(
              [
                {
                  page: ReceiptPage.Food,
                  item: 'Some food item',
                  category: 'Fruit',
                  cost: 123,
                },
                {
                  page: ReceiptPage.General,
                  item: 'Other general item',
                  category: 'Some general category', // from manual input
                  cost: 456,
                },
              ].map(expect.objectContaining),
            ),
          }),
        }),
        {},
      );
    });

    it('should clear all inputs', async () => {
      expect.hasAssertions();
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
      expect.hasAssertions();
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
      expect.hasAssertions();
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
