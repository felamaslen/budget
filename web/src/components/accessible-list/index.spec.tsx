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
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';

import { AccessibleList, AccessibleListStandard, Props } from '.';
import { FieldComponent, FormFieldTextInline } from '~client/components/form-field';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { ListState } from '~client/reducers/list';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import {
  GQL,
  ListItemInput,
  ListItemStandardNative as ListItemStandard,
  PageListStandard,
  RequestType,
  WithIds,
} from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('<AccessibleList />', () => {
  /**
   * <AccessibleList /> is a generic React component which is meant to integrate
   * with the Redux store. It is analogous to the list reducer, with a specific
   * version for daily totals calculation, and extensible for things like the funds page.
   */

  const myPage = PageListStandard.Income as const;
  type MyPage = typeof myPage;

  type MyState<I extends GQL<ListItemInput> = GQL<ListItemInput>> = {
    [myPage]: ListState<WithIds<I>>;
  };

  const testState: MyState<GQL<ListItemStandard>> = {
    [myPage]: {
      items: [
        {
          id: numericHash('real-id-b'),
          date: new Date('2020-04-13'),
          item: 'Item b',
          cost: 9881,
        },
        {
          id: numericHash('real-id-a'),
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

  const onCreate = jest.fn();
  const onUpdate = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.spyOn(listMutationHooks, 'useListCrudStandard').mockReturnValue({
      onCreate,
      onUpdate,
      onDelete,
    });
  });

  afterEach(async () => {
    matchMedia.clear();
  });

  const getContainerBase = <
    I extends ListItemInput,
    E extends Record<string, unknown> = Record<string, unknown>
  >(
    state: MyState<I>,
    props: Omit<Props<I, MyPage, never, E>, 'onCreate' | 'onUpdate' | 'onDelete'>,
    existingStore?: MockStore<MyState<I>>,
  ): RenderResult & { store: MockStore<MyState<I>> } => {
    const store = existingStore ?? createStore<MyState<I>>()(state);
    const utils = render(
      <GQLProviderMock>
        <Provider store={store}>
          <AccessibleList<I, MyPage, never, E>
            {...props}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </Provider>
      </GQLProviderMock>,
    );
    return { ...utils, store };
  };

  const getContainerStandard = <I extends ListItemStandard = ListItemStandard>(
    state: MyState<I> = testState as MyState<I>,
    existingStore?: MockStore<MyState>,
    renderOptions: RenderOptions = {},
  ): RenderResult & { store: MockStore<MyState> } => {
    const store = existingStore ?? createStore<MyState>()(state);
    const utils = render(
      <GQLProviderMock>
        <Provider store={store}>
          <AccessibleListStandard<MyPage> page={myPage} />
        </Provider>
      </GQLProviderMock>,
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
    const MyCustomHeader: React.FC = () => (
      <div role="heading" aria-level={1}>
        This is a custom header
      </div>
    );

    const setup = (): RenderResult =>
      getContainerBase<ListItemInput>(
        {
          [myPage]: { items: [], __optimistic: [] },
        },
        {
          page: myPage,
          fields: {
            item: FormFieldTextInline,
          },
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
            id: numericHash('real-id-c'),
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
    listIndex | stateIndex | position    | id                          | date            | item        | cost
    ${0}      | ${1}       | ${'first'}  | ${numericHash('real-id-a')} | ${'2020-04-20'} | ${'Item a'} | ${287}
    ${1}      | ${0}       | ${'second'} | ${numericHash('real-id-b')} | ${'2020-04-13'} | ${'Item b'} | ${9881}
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

      it('should call onUpdate when changed', () => {
        expect.assertions(3);
        const { getByDisplayValue } = getContainerStandard();
        const input = getByDisplayValue(inputValue) as HTMLInputElement;

        act(() => {
          fireEvent.change(input, { target: { value: valueUpdate } });
        });

        expect(onUpdate).not.toHaveBeenCalled();

        act(() => {
          fireEvent.blur(input);
        });

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith(
          id,
          { [field]: newValue ?? valueUpdate },
          testState[myPage].items[stateIndex],
        );
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

        it('should not call onUpdate', () => {
          expect.assertions(1);
          const { input } = setup();
          act(() => {
            fireEvent.blur(input);
          });
          expect(onUpdate).not.toHaveBeenCalled();
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

        it('should call onDelete when clicked', () => {
          expect.assertions(2);
          const { button } = getDeleteButton();

          act(() => {
            fireEvent.click(button);
          });

          expect(onDelete).toHaveBeenCalledTimes(1);
          expect(onDelete).toHaveBeenCalledWith(id, testState[myPage].items[stateIndex]);
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
          const { input } = getCreateInput();
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
          expect(onCreate).not.toHaveBeenCalled();
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
        expect(onCreate).not.toHaveBeenCalled();
        await setup();

        await waitFor(() => {
          expect(onCreate).toHaveBeenCalledTimes(1);
          expect(onCreate).toHaveBeenCalledWith({
            date: new Date('2020-06-05'),
            item: 'Different item innit',
            cost: 1065,
          });
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

    type ItemWithCustomField = { item: string; myCustomField: MyCustomFieldValue };

    const mockCustomFieldUpdate = {
      something: 'some new value',
      otherThing: true,
    };

    const MyCustomField: FieldComponent<MyCustomFieldValue | undefined> = ({ value, onChange }) => (
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
      id: numericHash('some-id'),
      item: 'Some item',
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

    const propsWithCustomField: Omit<
      Props<ItemWithCustomField, MyPage>,
      'onCreate' | 'onUpdate' | 'onDelete'
    > = {
      page: myPage,
      fields: {
        item: FormFieldTextInline,
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
      expect.assertions(2);
      const { getByRole } = getContainerBase(stateWithCustomField, propsWithCustomField);
      const listItem = getByRole('listitem');
      const { getByTestId } = within(listItem);
      const button = getByTestId('custom-field-change') as HTMLButtonElement;
      act(() => {
        fireEvent.click(button);
      });
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(
        mockCustomFieldItem.id,
        { myCustomField: mockCustomFieldUpdate },
        stateWithCustomField[myPage].items[0],
      );
    });
  });

  describe('custom selector', () => {
    type ExtraProps = {
      selectorApplied: boolean;
    };

    const customSelector = (): { [id: number]: ExtraProps } => ({
      [numericHash('real-id-b')]: { selectorApplied: true },
    });

    const CustomItemField: FieldComponent<string | undefined, ExtraProps> = ({
      value,
      onChange,
      extraProps,
    }) => (
      <>
        <input
          value={value}
          onChange={({ target: { value: newValue } }): void => onChange(newValue)}
        />
        <span data-testid="selector-applied">{extraProps?.selectorApplied ? 'yes' : 'no'}</span>
      </>
    );

    const setupWithSelector = (): RenderResult & { store: MockStore<MyState<ListItemInput>> } =>
      getContainerBase<ListItemInput, ExtraProps>(testState, {
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

    const itemProcessor = (item: ListItemInput): Partial<ExtraProps> => ({
      selectorApplied: item.item === 'Item b',
    });

    const CustomItemField: FieldComponent<string | undefined, ExtraProps> = ({
      value,
      onChange,
      extraProps,
    }) => (
      <>
        <input
          value={value}
          onChange={({ target: { value: newValue } }): void => onChange(newValue)}
        />
        <span data-testid="selector-applied">{extraProps?.selectorApplied ? 'yes' : 'no'}</span>
      </>
    );

    const setupWithSelector = (): RenderResult & { store: MockStore<MyState<ListItemInput>> } =>
      getContainerBase<ListItemInput, ExtraProps>(testState, {
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
