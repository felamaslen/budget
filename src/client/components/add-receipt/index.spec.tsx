import { act, waitFor, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchMediaMock from 'jest-matchmedia-mock';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { AddReceipt, Props } from '.';
import * as ListMutations from '~client/gql/mutations/list';
import * as SearchQueries from '~client/gql/queries/search';
import { mockClient, renderWithStore } from '~client/test-utils';
import { ReceiptPage } from '~client/types/enum';
import type { QueryReceiptItemArgs, QueryReceiptItemsArgs } from '~client/types/gql';

jest.mock('shortid', () => ({
  generate: (): string => 'some-short-id',
}));

describe('<AddReceipt />', () => {
  const props: Props = {
    setAddingReceipt: jest.fn(),
  };

  let matchMedia: MatchMediaMock;
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  let mutateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (
        request.query === SearchQueries.ReceiptItem &&
        (request.variables as QueryReceiptItemArgs).item === 'cri'
      ) {
        return fromValue({
          operation: makeOperation('query', request, {} as OperationContext),
          data: {
            receiptItem: 'Crisps',
          },
        });
      }
      if (
        request.query === SearchQueries.ReceiptItems &&
        (request.variables as QueryReceiptItemsArgs).items[0] === 'Some food item' &&
        (request.variables as QueryReceiptItemsArgs).items[1] === 'Other general item'
      ) {
        return fromValue({
          operation: makeOperation('query', request, {} as OperationContext),
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
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });

    mutateSpy = jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) => {
      if (request.query === ListMutations.CreateReceipt) {
        return fromValue({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: {
            createReceipt: {
              error: null,
            },
          },
        });
      }
      return fromValue({
        operation: makeOperation('mutation', request, {} as OperationContext),
        data: null,
      });
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });

    matchMedia.clear();
    mutateSpy.mockRestore();
  });

  const setup = (): RenderResult => renderWithStore(<AddReceipt {...props} />);

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
      userEvent.clear(inputDate);
      userEvent.type(inputDate, date);
      userEvent.tab();
    };

    const setShop = (result: RenderResult, shop: string): void => {
      const inputShop = result.getByLabelText('Shop');
      userEvent.clear(inputShop);
      userEvent.type(inputShop, shop);
      userEvent.tab();
    };

    const addItem = (
      result: RenderResult,
      item: string,
      cost: string,
      page = 'Food',
      category = '{rightArrow}',
    ): void => {
      const inputsPage = result.getAllByDisplayValue('Food');
      const inputsItem = result.getAllByPlaceholderText('Item');
      const inputsCategory = result.getAllByPlaceholderText('Category');
      const inputsCost = result.getAllByDisplayValue('0.00');

      const inputPage = inputsPage[inputsPage.length - 1];
      const inputItem = inputsItem[inputsItem.length - 1];
      const inputCategory = inputsCategory[inputsCategory.length - 1];
      const inputCost = inputsCost[inputsCost.length - 1];

      userEvent.clear(inputItem);
      userEvent.type(inputItem, item);

      userEvent.clear(inputCost);
      userEvent.type(inputCost, cost);

      userEvent.selectOptions(inputPage, page);

      userEvent.clear(inputCategory);
      userEvent.type(inputCategory, category);

      userEvent.tab();
    };

    const enterReceipt = async (): Promise<RenderResult> => {
      const result = setup();

      setDate(result, '20/4/20');

      addItem(result, 'Some food item', '1.23');

      const buttonAdd = result.getByText('+') as HTMLButtonElement;
      await waitFor(() => {
        expect(buttonAdd.disabled).toBe(false);
      });
      userEvent.click(buttonAdd);

      addItem(result, 'Some general item', '4.56', 'General', 'Some general category');

      setShop(result, "Sainsbury's");

      const inputGeneralItem = result.getByDisplayValue('Some general item');

      userEvent.clear(inputGeneralItem);
      userEvent.type(inputGeneralItem, 'Other general item');

      const inputComplete = result.getByText('Autocomplete') as HTMLButtonElement;
      userEvent.click(inputComplete);

      await waitFor(() => {
        expect(result.getByText('Finish')).toBeInTheDocument();
      });

      const inputFinish = result.getByText('Finish') as HTMLButtonElement;
      await waitFor(() => {
        expect(inputFinish.disabled).toBe(false);
      });
      userEvent.click(inputFinish);

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
      userEvent.click(result.getByText('+'));
      addItem(result, 'Other general item', '4.56');

      expect(result.getByText('Total: £5.79')).toBeInTheDocument();
    });
  });

  describe('when autocompleting an item field', () => {
    it('should make the case consistent', async () => {
      expect.hasAssertions();
      const { getAllByPlaceholderText, getByText } = setup();
      const inputItem = getAllByPlaceholderText('Item')[0] as HTMLInputElement;

      userEvent.clear(inputItem);
      userEvent.type(inputItem, 'cri');

      await waitFor(() => {
        expect(getByText('Crisps')).toBeInTheDocument();
        expect(inputItem.value).toBe('Cri');
      });

      userEvent.tab();

      expect(inputItem.value).toBe('Cri');
    });
  });
});
