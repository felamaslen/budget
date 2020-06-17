import {
  act,
  fireEvent,
  render,
  RenderResult,
  within,
  RenderOptions,
  waitFor,
} from '@testing-library/react';
import format from 'date-fns/format';
import MatchMediaMock from 'jest-matchmedia-mock';
import MockDate from 'mockdate';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';

import { AccessibleList, AccessibleListStandard, Props } from '.';
import { listItemCreated, listItemDeleted, listItemUpdated } from '~client/actions';
import { ListState } from '~client/reducers/list';
import { RequestType, Item, ListItem, ListCalcItem } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('<AccessibleList />', () => {
  /**
   * <AccessibleList /> is a generic React component which is meant to integrate
   * with the Redux store. It is analogous to the list reducer, with a specific
   * version for daily totals calculation, and extensible for things like the funds page.
   */

  type MyPage = 'myPage';
  const myPage: MyPage = 'myPage';

  type MyState<I extends Item = ListItem> = {
    [myPage]: ListState<I>;
  };

  const testState: MyState<ListCalcItem> = {
    [myPage]: {
      items: [
        {
          id: 'real-id-b',
          date: new Date('2020-04-13'),
          item: 'Item b',
          cost: 9881,
        },
        {
          id: 'real-id-a',
          date: new Date('2020-04-20'),
          item: 'Item a',
          cost: 287,
        },
      ],
      __optimistic: [undefined, undefined],
    },
  };

  let matchMedia: MatchMediaMock;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
    MockDate.set(new Date('2020-05-03'));
  });
  afterAll(() => {
    MockDate.reset();
  });

  beforeEach(() => {
    nock('http://localhost')
      .get('/api/v4/data/search/myPage/item/Different%20item%20innit/5')
      .reply(200, { data: { list: [] } });
  });

  afterEach(async () => {
    matchMedia.clear();
  });

  const getContainerBase = <I extends Item, E extends {} = {}>(
    state: MyState<I>,
    props: Props<I, MyPage, never, E>,
    existingStore?: MockStore<MyState<I>>,
  ): RenderResult & { store: MockStore<MyState<I>> } => {
    const store = existingStore ?? createStore<MyState<I>>()(state);
    const utils = render(
      <Provider store={store}>
        <AccessibleList<I, MyPage, never, E> {...props} />
      </Provider>,
    );
    return { ...utils, store };
  };

  const getContainerStandard = <I extends ListCalcItem = ListCalcItem>(
    state: MyState<I> = testState as MyState<I>,
    existingStore?: MockStore<MyState>,
    renderOptions: RenderOptions = {},
  ): RenderResult & { store: MockStore<MyState> } => {
    const store = existingStore ?? createStore<MyState>()(state);
    const utils = render(
      <Provider store={store}>
        <AccessibleListStandard<MyPage> page={myPage} />
      </Provider>,
      renderOptions,
    );
    return { ...utils, store };
  };

  describe('standard header', () => {
    it('should be rendered', () => {
      expect.assertions(4);
      const { getByRole } = getContainerStandard();
      const header = getByRole('heading');

      expect(header).toBeInTheDocument();

      const { getByText } = within(header);

      expect(getByText('Date')).toBeInTheDocument();
      expect(getByText('Item')).toBeInTheDocument();
      expect(getByText('Cost')).toBeInTheDocument();
    });
  });

  describe('custom header', () => {
    const MyCustomHeader: React.FC = () => <div role="heading">This is a custom header</div>;

    const setup = (): RenderResult =>
      getContainerBase(
        {
          [myPage]: { items: [], __optimistic: [] },
        },
        {
          page: myPage,
          fields: {},
          Header: MyCustomHeader,
        },
      );

    it('should be rendered', () => {
      expect.assertions(2);
      const { getByRole } = setup();
      const header = getByRole('heading');

      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('This is a custom header');
    });
  });

  it('should render the items in descending order of date', () => {
    expect.assertions(3);
    const { getByRole } = getContainerStandard();
    const list = getByRole('list');
    const { getAllByRole } = within(list);
    const listItems = getAllByRole('listitem') as HTMLElement[];

    expect(listItems).toHaveLength(2);

    const { getByDisplayValue: getFirstValue } = within(listItems[0]);
    const { getByDisplayValue: getSecondValue } = within(listItems[1]);

    expect(getFirstValue('20/04/2020')).toBeInTheDocument();
    expect(getSecondValue('13/04/2020')).toBeInTheDocument();
  });

  it('should not render optimistically deleted items', () => {
    expect.assertions(3);
    const { queryByDisplayValue } = getContainerStandard({
      ...testState,
      [myPage]: {
        ...testState[myPage],
        items: [
          ...testState[myPage].items,
          {
            id: 'real-id-c',
            date: new Date('2020-03-01'),
            item: 'Item c',
            cost: 176,
          },
        ],
        __optimistic: [...testState[myPage].__optimistic, RequestType.delete],
      },
    });

    expect(queryByDisplayValue('01/03/2020')).not.toBeInTheDocument();
    expect(queryByDisplayValue('Item c')).not.toBeInTheDocument();
    expect(queryByDisplayValue('1.76')).not.toBeInTheDocument();
  });

  describe.each`
    listIndex | stateIndex | position    | id             | date            | item        | cost
    ${0}      | ${1}       | ${'first'}  | ${'real-id-a'} | ${'2020-04-20'} | ${'Item a'} | ${287}
    ${1}      | ${0}       | ${'second'} | ${'real-id-b'} | ${'2020-04-13'} | ${'Item b'} | ${9881}
  `('the $position item', ({ listIndex, stateIndex, id, date, item, cost }) => {
    const dateInput = format(new Date(date), 'dd/MM/yyyy');
    const costInput = String(cost / 100);

    describe.each`
      field     | inputValue   | valueUpdate               | newValue
      ${'date'} | ${dateInput} | ${'3/7/20'}               | ${new Date('2020-07-03')}
      ${'item'} | ${item}      | ${'Different item innit'} | ${undefined}
      ${'cost'} | ${costInput} | ${'10.65'}                | ${1065}
    `('$field field', ({ field, inputValue, valueUpdate, newValue }) => {
      it('should be rendered', () => {
        expect.assertions(2);
        const { getByDisplayValue } = getContainerStandard();
        const input = getByDisplayValue(inputValue) as HTMLInputElement;

        expect(input).toBeInTheDocument();
        expect(input.type).toBe('text'); // all inline fields
      });

      it('should dispatch an action when changed', () => {
        expect.assertions(2);
        const { store, getByDisplayValue } = getContainerStandard();
        const input = getByDisplayValue(inputValue) as HTMLInputElement;
        const expectedAction = listItemUpdated<ListItem, MyPage>(myPage)(
          id,
          {
            [field]: newValue ?? valueUpdate,
          },
          testState[myPage].items[stateIndex],
        );

        act(() => {
          fireEvent.change(input, { target: { value: valueUpdate } });
        });

        expect(store.getActions()).toHaveLength(0);

        act(() => {
          fireEvent.blur(input);
        });

        expect(store.getActions()).toStrictEqual(expect.arrayContaining([expectedAction]));
      });

      describe('when the value is set to empty', () => {
        const setup = (): RenderResult & { input: HTMLInputElement; store: MockStore<MyState> } => {
          const renderResult = getContainerStandard();
          const input = renderResult.getByDisplayValue(inputValue) as HTMLInputElement;

          act(() => {
            fireEvent.change(input, {
              target: { value: '' },
            });
          });

          return { input, ...renderResult };
        };

        it('should not dispatch an action', () => {
          expect.assertions(1);
          const { input, store } = setup();
          act(() => {
            fireEvent.blur(input);
          });
          expect(store.getActions()).toHaveLength(0);
        });

        it('should reset the input value on blur', () => {
          expect.assertions(2);
          const { input, container } = setup();

          expect(input.value).toBe('');
          act(() => {
            fireEvent.blur(input);
          });

          act(() => {
            const { getByDisplayValue } = getContainerStandard(testState, undefined, { container });

            expect(getByDisplayValue(inputValue)).toBeInTheDocument();
          });
        });
      });

      describe('delete button', () => {
        const getDeleteButton = (): {
          store: MockStore<MyState>;
          button: HTMLButtonElement;
        } => {
          const { store, getAllByText } = getContainerStandard();
          const deleteButtons = getAllByText('−') as HTMLButtonElement[];
          const button = deleteButtons[listIndex];

          return { store, button };
        };

        it('should be rendered', () => {
          expect.assertions(1);
          const { button } = getDeleteButton();
          expect(button).toBeInTheDocument();
        });

        it('should dispatch an action when clicked', () => {
          expect.assertions(1);
          const { button, store } = getDeleteButton();
          const expectedAction = listItemDeleted<ListItem, MyPage>(myPage)(
            id,
            testState[myPage].items[stateIndex],
          );

          act(() => {
            fireEvent.click(button);
          });

          expect(store.getActions()).toStrictEqual(expect.arrayContaining([expectedAction]));
        });
      });
    });
  });

  describe('create form', () => {
    const getInputs = (): {
      inputs: HTMLElement[];
      createForm: HTMLElement;
      renderResult: { store: MockStore<MyState> } & RenderResult;
    } => {
      const renderResult = getContainerStandard();
      const createForm = renderResult.getByTestId('create-form') as HTMLElement;
      const { getAllByRole } = within(createForm);
      const inputs = getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];

      return { createForm, inputs, renderResult };
    };

    describe.each`
      index | field     | initialValue    | valueInsert               | inputValueAfter
      ${0}  | ${'date'} | ${'03/05/2020'} | ${'3/7'}                  | ${'03/07/2020'}
      ${1}  | ${'item'} | ${''}           | ${'Different item innit'} | ${undefined}
      ${2}  | ${'cost'} | ${''}           | ${'10.65'}                | ${undefined}
    `(
      '$field field',
      ({ index, field, initialValue, valueInsert, inputValueAfter = valueInsert }) => {
        const getCreateInput = (): {
          input: HTMLInputElement;
          renderResult: { store: MockStore<MyState> } & RenderResult;
        } => {
          const { inputs, renderResult } = getInputs();
          const input = inputs[index] as HTMLInputElement;

          return { input, renderResult };
        };

        it('should be rendered', () => {
          expect.assertions(2);
          const { input } = getCreateInput();
          expect(input).toBeInTheDocument();
          expect(input.value).toBe(initialValue);
        });

        it('should not call onCreate immediately on change', async () => {
          expect.assertions(2);
          const { input, renderResult } = getCreateInput();
          act(() => {
            fireEvent.focus(input);
          });
          act(() => {
            fireEvent.change(input, { target: { value: valueInsert } });
          });
          act(() => {
            fireEvent.blur(input);
          });
          expect(input.value).toBe(inputValueAfter);
          expect(renderResult.store.getActions()).toHaveLength(0);
        });

        describe('when the value is set to empty', () => {
          const setup = async (): Promise<{
            input: HTMLInputElement;
            store: MockStore<MyState>;
          }> => {
            const {
              input,
              renderResult: { store },
            } = getCreateInput();

            act(() => {
              fireEvent.change(input, {
                target: { value: '' },
              });
            });

            return { input, store };
          };

          it('should not reset the input value on blur', async () => {
            expect.assertions(2);
            const { input } = await setup();

            expect(input.value).toBe('');
            act(() => {
              fireEvent.blur(input);
            });
            expect(input.value).toBe(field === 'date' ? initialValue : '');
          });
        });
      },
    );

    describe('after adding values to the form', () => {
      const setup = async (): Promise<{
        renderResult: { store: MockStore<MyState> } & RenderResult;
        dateInput: HTMLInputElement;
        itemInput: HTMLInputElement;
        costInput: HTMLInputElement;
        addButton: HTMLButtonElement;
      }> => {
        const { inputs, createForm, renderResult } = getInputs();
        const [dateInput, itemInput, costInput] = inputs as HTMLInputElement[];
        const { getByText } = within(createForm);
        const addButton = getByText('Add') as HTMLButtonElement;

        act(() => {
          fireEvent.focus(dateInput);
        });
        act(() => {
          fireEvent.change(dateInput, { target: { value: '5/6' } });
        });
        act(() => {
          fireEvent.blur(dateInput);
        });
        act(() => {
          fireEvent.focus(itemInput);
        });
        act(() => {
          fireEvent.change(itemInput, { target: { value: 'Different item innit' } });
        });
        act(() => {
          fireEvent.blur(itemInput);
        });
        act(() => {
          fireEvent.focus(costInput);
        });
        act(() => {
          fireEvent.change(costInput, { target: { value: '10.65' } });
        });
        act(() => {
          fireEvent.blur(costInput);
        });

        act(() => {
          fireEvent.click(addButton);
        });

        return { renderResult, dateInput, itemInput, costInput, addButton };
      };

      // eslint-disable-next-line jest/prefer-expect-assertions
      it('should call onCreate after pressing the add button', async () => {
        const {
          renderResult: { store },
        } = await setup();

        const expectedAction = listItemCreated<ListCalcItem, MyPage>(myPage)({
          date: new Date('2020-06-05'),
          item: 'Different item innit',
          cost: 1065,
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual(
            expect.arrayContaining([{ ...expectedAction, fakeId: 'some-fake-id' }]),
          );
        });
      });

      // eslint-disable-next-line jest/prefer-expect-assertions
      it('should reset the input values after creating an item', async () => {
        const { dateInput, itemInput, costInput } = await setup();

        await waitFor(() => {
          expect(dateInput.value).toBe('03/05/2020');
          expect(itemInput.value).toBe('');
          expect(costInput.value).toBe('');
        });
      });

      // eslint-disable-next-line jest/prefer-expect-assertions
      it('should focus the first input field so that another item can be created quickly', async () => {
        const { dateInput } = await setup();

        await waitFor(() => {
          expect(document.activeElement).toBe(dateInput);
        });
      });
    });
  });

  describe('custom fields', () => {
    type MyCustomFieldValue = {
      something: string;
      otherThing: boolean;
    };

    type ItemWithCustomField = { id: string; myCustomField: MyCustomFieldValue };

    const mockCustomFieldUpdate = {
      something: 'some new value',
      otherThing: true,
    };

    const MyCustomField: React.FC<{
      value: MyCustomFieldValue | undefined;
      onChange: (value: MyCustomFieldValue | undefined) => void;
    }> = ({ value, onChange }) => (
      <>
        <span data-testid="custom-field-title">my custom interactive field</span>
        <span data-testid="custom-field-value">{JSON.stringify(value)}</span>
        <button
          data-testid="custom-field-change"
          onClick={(): void => onChange(mockCustomFieldUpdate)}
        />
      </>
    );

    const mockCustomFieldItem = {
      id: 'some-id',
      myCustomField: {
        something: 'custom field value',
        otherThing: false,
      },
    };

    const stateWithCustomField: MyState<ItemWithCustomField> = {
      ...testState,
      [myPage]: {
        ...testState[myPage],
        items: [mockCustomFieldItem],
      },
    };

    const propsWithCustomField: Props<ItemWithCustomField, MyPage> = {
      page: myPage,
      fields: {
        myCustomField: MyCustomField,
      },
    };

    it('should be rendered', () => {
      expect.assertions(1);
      const { getByRole } = getContainerBase(stateWithCustomField, propsWithCustomField);
      const listItem = getByRole('listitem');
      const { getByText } = within(listItem);
      const field = getByText('my custom interactive field');
      expect(field).toBeInTheDocument();
    });

    it('should accept the value', () => {
      expect.assertions(1);
      const { getByRole } = getContainerBase(stateWithCustomField, propsWithCustomField);
      const listItem = getByRole('listitem');
      const { getByTestId } = within(listItem);
      const value = getByTestId('custom-field-value');
      expect(value).toHaveTextContent(JSON.stringify(mockCustomFieldItem.myCustomField));
    });

    it('should accept onChange', () => {
      expect.assertions(1);
      const { store, getByRole } = getContainerBase(stateWithCustomField, propsWithCustomField);
      const listItem = getByRole('listitem');
      const { getByTestId } = within(listItem);
      const button = getByTestId('custom-field-change') as HTMLButtonElement;
      act(() => {
        fireEvent.click(button);
      });
      expect(store.getActions()).toStrictEqual(
        expect.arrayContaining([
          listItemUpdated<ItemWithCustomField, MyPage>(myPage)(
            mockCustomFieldItem.id,
            {
              myCustomField: mockCustomFieldUpdate,
            },
            stateWithCustomField[myPage].items[0],
          ),
        ]),
      );
    });
  });

  describe('custom selector', () => {
    type ExtraProps = {
      selectorApplied: boolean;
    };

    const customSelector = (): { [id: string]: ExtraProps } => ({
      'real-id-b': { selectorApplied: true },
    });

    const CustomItemField: React.FC<{
      value: string | undefined;
      onChange: (value: string | undefined) => void;
      extraProps?: ExtraProps;
    }> = ({ value, onChange, extraProps }) => (
      <>
        <input
          value={value}
          onChange={({ target: { value: newValue } }): void => onChange(newValue)}
        />
        <span data-testid="selector-applied">{extraProps?.selectorApplied ? 'yes' : 'no'}</span>
      </>
    );

    const setupWithSelector = (): RenderResult & { store: MockStore<MyState<Item>> } =>
      getContainerBase<Item, ExtraProps>(testState, {
        page: myPage,
        fields: {
          item: CustomItemField,
        },
        customSelector,
      });

    it('should be applied as directed', () => {
      expect.assertions(3);
      const { getAllByTestId } = setupWithSelector();
      const outputs = getAllByTestId('selector-applied') as HTMLSpanElement[];
      const [outputCreate, outputItemB, outputItemA] = outputs;

      expect(outputCreate).toHaveTextContent('no');
      expect(outputItemA).toHaveTextContent('no');
      expect(outputItemB).toHaveTextContent('yes');
    });
  });

  describe('item processor', () => {
    type ExtraProps = {
      selectorApplied: boolean;
    };

    const itemProcessor = (item: Item): Partial<ExtraProps> => ({
      selectorApplied: item.id === 'real-id-b',
    });

    const CustomItemField: React.FC<{
      value: string | undefined;
      onChange: (value: string | undefined) => void;
      extraProps?: ExtraProps;
    }> = ({ value, onChange, extraProps }) => (
      <>
        <input
          value={value}
          onChange={({ target: { value: newValue } }): void => onChange(newValue)}
        />
        <span data-testid="selector-applied">{extraProps?.selectorApplied ? 'yes' : 'no'}</span>
      </>
    );

    const setupWithSelector = (): RenderResult & { store: MockStore<MyState<Item>> } =>
      getContainerBase<Item, ExtraProps>(testState, {
        page: myPage,
        fields: {
          item: CustomItemField,
        },
        itemProcessor,
      });

    it('should be applied as directed', () => {
      expect.assertions(3);
      const { getAllByTestId } = setupWithSelector();
      const outputs = getAllByTestId('selector-applied') as HTMLSpanElement[];
      const [outputCreate, outputItemB, outputItemA] = outputs;

      expect(outputCreate).toHaveTextContent('no');
      expect(outputItemA).toHaveTextContent('no');
      expect(outputItemB).toHaveTextContent('yes');
    });
  });
});
