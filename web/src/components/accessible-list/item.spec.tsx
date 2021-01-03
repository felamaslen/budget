import { render, RenderResult, fireEvent, within, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';
import sinon from 'sinon';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { AccessibleListCreateItem } from './item';
import type { PropsItemCreate } from './types';
import { FormFieldTextInline } from '~client/components/form-field';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { PageListStandard } from '~client/types/enum';
import type { SearchResult } from '~client/types/gql';

describe('Accessible list create item', () => {
  let clock: sinon.SinonFakeTimers;
  beforeAll(() => {
    clock = sinon.useFakeTimers();
  });
  afterAll(() => {
    clock.restore();
  });

  const myPage = PageListStandard.Income as const;

  type MyItem = {
    item: string;
    category: string;
  };

  const props: PropsItemCreate<MyItem, typeof myPage> = {
    fields: {
      item: FormFieldTextInline,
      category: FormFieldTextInline,
    },
    onCreate: jest.fn(),
    page: myPage,
    suggestionFields: ['item'],
  };

  const setup = (customProps = {}, searchResult: Partial<SearchResult> = {}): RenderResult =>
    render(
      <Provider store={createStore<State>()(testState)}>
        <GQLProviderMock
          client={
            ({
              executeQuery: () =>
                fromValue({
                  data: { search: searchResult },
                }),
            } as unknown) as Client
          }
        >
          <AccessibleListCreateItem<MyItem, typeof myPage> {...props} {...customProps} />
        </GQLProviderMock>
      </Provider>,
    );

  describe('when suggestions are available', () => {
    const setupToSuggestions = (
      withNext = false,
    ): RenderResult & {
      inputs: HTMLInputElement[];
    } => {
      const renderResult = setup(
        {},
        {
          list: ['Crockery', 'Caster sugar', 'Abacus'],
          nextCategory: withNext ? ['Kitchen', 'Sugar', 'Household'] : null,
          nextField: withNext ? 'category' : null,
          searchTerm: 'c',
        },
      );
      const inputs = renderResult.getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];

      return { ...renderResult, inputs };
    };

    const setupWithSuggestions = async (
      withNext = false,
    ): Promise<
      RenderResult & {
        inputs: HTMLInputElement[];
        suggestionItems: HTMLButtonElement[];
      }
    > => {
      const renderResult = setupToSuggestions(withNext);

      const [inputSomeField] = renderResult.inputs;

      act(() => {
        fireEvent.change(inputSomeField, {
          target: { value: 'c' },
        });

        clock.runAll();
      });

      const list = renderResult.getByRole('list', { hidden: true });
      const { getAllByRole: getSuggestions } = within(list);
      const suggestionItems = getSuggestions('button', { hidden: true }) as HTMLButtonElement[];

      return { suggestionItems, ...renderResult };
    };

    it('should request and render a suggestions list when typing', async () => {
      expect.assertions(4);

      const { suggestionItems } = await setupWithSuggestions();

      expect(suggestionItems).toHaveLength(3);

      expect(suggestionItems[0]).toHaveTextContent('Crockery');
      expect(suggestionItems[1]).toHaveTextContent('Caster sugar');
      expect(suggestionItems[2]).toHaveTextContent('Abacus');
    });

    it('should not render the suggestions list until the suggestions are loaded', async () => {
      expect.assertions(2);

      const { queryByRole, inputs } = setupToSuggestions();
      const [inputSomeField] = inputs;

      expect(queryByRole('list', { hidden: true })).not.toBeInTheDocument();

      act(() => {
        fireEvent.change(inputSomeField, {
          target: { value: 'c' },
        });
      });

      act(() => {
        clock.runAll();
      });

      expect(queryByRole('list', { hidden: true })).toBeInTheDocument();
    });

    it('should not request or render the suggestions list for non-suggestion fields', () => {
      expect.assertions(1);

      const { queryByRole, getAllByRole } = setup();
      const inputs = getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];

      const inputNextField = inputs[1];

      act(() => {
        fireEvent.change(inputNextField, {
          target: { value: 'c' },
        });
      });

      expect(queryByRole('list')).not.toBeInTheDocument();
    });

    const setupWithSelection = async (
      withNext = false,
      index = 1,
    ): Promise<
      RenderResult & {
        inputSomeField: HTMLInputElement;
        inputNextField: HTMLInputElement;
      }
    > => {
      const renderResult = await setupWithSuggestions(withNext);
      const { inputs, suggestionItems } = renderResult;

      const inputSomeField = inputs[0];
      const inputNextField = inputs[1];

      act(() => {
        fireEvent.focus(suggestionItems[index]);
      });
      act(() => {
        fireEvent.keyDown(suggestionItems[index], {
          key: 'Enter',
        });
      });

      return { ...renderResult, inputSomeField, inputNextField };
    };

    describe('when selecting a suggestion', () => {
      it('should change the value of the current input', async () => {
        expect.assertions(1);

        const { inputSomeField } = await setupWithSelection();

        act(() => {
          clock.runAll();
        });

        expect(inputSomeField.value).toBe('Caster sugar');
      });

      it('should focus the next input', async () => {
        expect.assertions(3);

        const { inputSomeField, inputNextField } = await setupWithSelection();

        act(() => {
          clock.runToLast();
        });
        expect(document.activeElement).toBe(inputSomeField);

        act(() => {
          clock.runToLast();
        });
        expect(inputSomeField.value).toBe('Caster sugar');

        act(() => {
          clock.runToLast();
        });
        expect(document.activeElement).toBe(inputNextField);
      });

      it('should add the suggested values to the created item', async () => {
        expect.assertions(3);
        const { inputSomeField, inputNextField, getByText } = await setupWithSelection();

        expect(inputSomeField.value).toBe('Caster sugar');

        act(() => {
          fireEvent.focus(inputNextField);
        });
        act(() => {
          fireEvent.change(inputNextField, { target: { value: 'Manual value' } });
        });

        act(() => {
          fireEvent.blur(inputNextField);
        });

        const addButton = getByText('Add') as HTMLButtonElement;

        act(() => {
          fireEvent.click(addButton);
        });

        act(() => {
          clock.runToLast();
        });

        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          item: 'Caster sugar',
          category: 'Manual value',
        });
      });

      describe('if on the last field of the create form', () => {
        it('should focus the add button', async () => {
          expect.assertions(3);

          const { getAllByRole, getByRole, getByText } = setup(
            {
              suggestionFields: ['item', 'category'],
            },
            {
              list: ['Zappa', 'Zenith'],
              nextCategory: null,
              nextField: null,
              searchTerm: 'z',
            },
          );

          const [, inputNextField] = getAllByRole('textbox', {
            hidden: true,
          }) as HTMLInputElement[];

          const addButton = getByText('Add') as HTMLButtonElement;

          act(() => {
            fireEvent.change(inputNextField, {
              target: { value: 'z' },
            });
          });

          act(() => {
            clock.runToLast();
          });

          expect(getAllByRole('listitem', { hidden: true }).length).toBeGreaterThan(0);

          const list = getByRole('list', { hidden: true });
          const { getAllByRole: getSuggestions } = within(list);
          const suggestionItems = getSuggestions('button', { hidden: true }) as HTMLButtonElement[];

          act(() => {
            fireEvent.focus(suggestionItems[1]);

            fireEvent.keyDown(suggestionItems[1], {
              key: 'Enter',
            });
          });

          expect(inputNextField.value).toBe('Zenith');

          act(() => {
            clock.runAll();
          });

          expect(document.activeElement).toBe(addButton);
        });
      });
    });

    describe('if there is a next column value', () => {
      it('should add the next column from suggestions', async () => {
        expect.assertions(2);

        const { inputSomeField, inputNextField } = await setupWithSelection(true, 0);

        act(() => {
          clock.runAll();
        });

        expect(inputSomeField.value).toBe('Crockery');
        expect(inputNextField.value).toBe('Kitchen');
      });

      it('should focus the next input', async () => {
        expect.assertions(4);

        const { inputNextField } = await setupWithSelection(true, 0);

        act(() => {
          clock.runAll();
        });

        expect(inputNextField.value).toBe('Kitchen');

        expect(document.activeElement).toBe(inputNextField);
        expect(inputNextField.selectionStart).toBe(0);
        expect(inputNextField.selectionEnd).toBe('Kitchen'.length);
      });
    });
  });
});
