import { RenderResult, fireEvent, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { AccessibleListCreateItem } from './item';
import type { PropsItemCreate } from './types';
import { FormFieldTextInline } from '~client/components/form-field';
import * as SearchQueries from '~client/gql/queries/search';
import { mockClient, renderWithStore } from '~client/test-utils';
import { PageListStandard } from '~client/types/enum';
import { QuerySearchArgs } from '~client/types/gql';

describe('accessible list create item', () => {
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

  beforeEach(() => {
    jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (request.query === SearchQueries.SearchSuggestions) {
        const hasNext = (request.variables as QuerySearchArgs).column === 'item';
        const nextField = hasNext ? 'category' : null;

        switch ((request.variables as QuerySearchArgs).searchTerm) {
          case 'c':
            return fromValue({
              operation: makeOperation('query', request, {} as OperationContext),
              data: {
                search: {
                  list: ['Crockery', 'Caster sugar', 'Abacus'],
                  nextCategory: hasNext ? ['Kitchen', 'Sugar', 'Household'] : null,
                  nextField,
                  searchTerm: 'c',
                },
              },
            });

          case 'z':
            return fromValue({
              operation: makeOperation('query', request, {} as OperationContext),
              data: {
                search: {
                  list: ['Zappa', 'Zenith'],
                  nextCategory: hasNext ? [] : null,
                  nextField,
                  searchTerm: 'z',
                },
              },
            });

          default:
            return fromValue({
              operation: makeOperation('query', request, {} as OperationContext),
              data: null,
            });
        }
      }

      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });
  });

  const setup = (customProps: Partial<typeof props> = {}): RenderResult =>
    renderWithStore(
      <AccessibleListCreateItem<MyItem, typeof myPage> {...props} {...customProps} />,
    );

  describe('when suggestions are available', () => {
    const setupToSuggestions = (): RenderResult & {
      inputs: HTMLInputElement[];
    } => {
      const renderResult = setup();
      const inputs = renderResult.getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];

      return { ...renderResult, inputs };
    };

    const setupWithSuggestions = async (): Promise<
      RenderResult & {
        inputs: HTMLInputElement[];
        suggestionItems: HTMLButtonElement[];
      }
    > => {
      const renderResult = setupToSuggestions();

      const [inputSomeField] = renderResult.inputs;

      userEvent.clear(inputSomeField);
      userEvent.type(inputSomeField, 'c');

      await waitFor(() => {
        expect(renderResult.getByRole('list', { hidden: true })).toBeInTheDocument();
      });

      const list = renderResult.getByRole('list', { hidden: true });
      const { getAllByRole: getSuggestions } = within(list);
      const suggestionItems = getSuggestions('button', { hidden: true }) as HTMLButtonElement[];

      return { suggestionItems, ...renderResult };
    };

    it('should request and render a suggestions list when typing', async () => {
      expect.hasAssertions();

      const { suggestionItems } = await setupWithSuggestions();

      expect(suggestionItems).toHaveLength(3);

      expect(suggestionItems[0]).toHaveTextContent('Crockery');
      expect(suggestionItems[1]).toHaveTextContent('Caster sugar');
      expect(suggestionItems[2]).toHaveTextContent('Abacus');
    });

    it('should not render the suggestions list until the suggestions are loaded', async () => {
      expect.hasAssertions();

      const { queryByRole, inputs } = setupToSuggestions();
      const [inputSomeField] = inputs;

      expect(queryByRole('list', { hidden: true })).not.toBeInTheDocument();

      userEvent.clear(inputSomeField);
      userEvent.type(inputSomeField, 'c');

      await waitFor(() => {
        expect(queryByRole('list', { hidden: true })).toBeInTheDocument();
      });
    });

    it('should not request or render the suggestions list for non-suggestion fields', () => {
      expect.assertions(1);

      const { queryByRole, getAllByRole } = setup();
      const inputs = getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];

      const inputNextField = inputs[1];

      userEvent.clear(inputNextField);
      userEvent.type(inputNextField, 'c');

      expect(queryByRole('list')).not.toBeInTheDocument();
    });

    const setupWithSelection = async (
      index = 1,
    ): Promise<
      RenderResult & {
        inputSomeField: HTMLInputElement;
        inputNextField: HTMLInputElement;
      }
    > => {
      const renderResult = await setupWithSuggestions();
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
        expect.hasAssertions();
        const { inputSomeField } = await setupWithSelection();

        expect(inputSomeField.value).toBe('Caster sugar');
      });

      it('should focus the next input', async () => {
        expect.hasAssertions();
        const { inputSomeField, inputNextField } = await setupWithSelection();

        expect(inputSomeField.value).toBe('Caster sugar');

        expect(document.activeElement).toBe(inputSomeField);
        await waitFor(() => {
          expect(document.activeElement).toBe(inputNextField);
        });
      });

      it('should add the suggested values to the created item', async () => {
        expect.hasAssertions();
        const { inputSomeField, inputNextField, getByText } = await setupWithSelection();

        expect(inputSomeField.value).toBe('Caster sugar');

        userEvent.tab();
        userEvent.clear(inputNextField);
        userEvent.type(inputNextField, 'Manual value');

        const addButton = getByText('Add') as HTMLButtonElement;
        userEvent.click(addButton);

        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          item: 'Caster sugar',
          category: 'Manual value',
        });
      });

      describe('if on the last field of the create form', () => {
        it('should focus the add button', async () => {
          expect.hasAssertions();

          const { getAllByRole, getByRole, getByText } = setup({
            suggestionFields: ['item', 'category'],
          });

          const [, inputNextField] = getAllByRole('textbox', {
            hidden: true,
          }) as HTMLInputElement[];

          const addButton = getByText('Add') as HTMLButtonElement;

          userEvent.clear(inputNextField);
          userEvent.type(inputNextField, 'z');

          await waitFor(() => {
            expect(getAllByRole('listitem', { hidden: true }).length).toBeGreaterThan(0);
          });

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

          await waitFor(() => {
            expect(document.activeElement).toBe(addButton);
          });
        });
      });
    });

    describe('if there is a next column value', () => {
      it('should add the next column from suggestions', async () => {
        expect.hasAssertions();

        const { inputSomeField, inputNextField } = await setupWithSelection(0);

        expect(inputSomeField.value).toBe('Crockery');
        expect(inputNextField.value).toBe('Kitchen');
      });

      it('should focus the next input', async () => {
        expect.hasAssertions();

        const { inputNextField } = await setupWithSelection(0);

        expect(inputNextField.value).toBe('Kitchen');

        await waitFor(() => {
          expect(document.activeElement).toBe(inputNextField);
        });
        expect(inputNextField.selectionStart).toBe(0);
        expect(inputNextField.selectionEnd).toBe('Kitchen'.length);
      });
    });
  });
});
