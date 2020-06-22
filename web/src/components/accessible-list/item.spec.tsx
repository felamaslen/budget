import { render, RenderResult, fireEvent, within, waitFor, act } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore from 'redux-mock-store';

import { AccessibleListCreateItem } from './item';
import { PropsItemCreate } from './types';
import { FormFieldTextInline } from '~client/components/form-field';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { Id } from '~client/types';

describe('Accessible list create item', () => {
  type MyPage = 'my-page';
  const myPage: MyPage = 'my-page';

  type MyItem = {
    id: Id;
    someField: string;
    nextField: string;
  };

  const props: PropsItemCreate<MyItem, MyPage> = {
    fields: {
      someField: FormFieldTextInline,
      nextField: FormFieldTextInline,
    },
    onCreate: jest.fn(),
    page: myPage,
    suggestionFields: ['someField'],
  };

  const setup = (customProps = {}): RenderResult =>
    render(
      <Provider store={createStore<State>()(testState)}>
        <AccessibleListCreateItem<MyItem, MyPage> {...props} {...customProps} />
      </Provider>,
    );

  describe('when suggestions are available', () => {
    const setupToSuggestions = (
      withNext = false,
    ): RenderResult & {
      inputs: HTMLInputElement[];
    } => {
      nock('http://localhost')
        .get('/api/v4/data/search/my-page/someField/c/5')
        .matchHeader('authorization', 'some api key')
        .reply(200, {
          data: {
            list: ['Crockery', 'Caster sugar', 'Abacus'],
            nextCategory: withNext ? ['Kitchen', 'Sugar', 'Household'] : undefined,
            nextField: withNext ? 'nextField' : undefined,
          },
        });

      const renderResult = setup();
      const inputs = renderResult.getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];

      const inputSomeField = inputs[0];

      act(() => {
        fireEvent.change(inputSomeField, {
          target: { value: 'c' },
        });
      });

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

      await waitFor(() => {
        expect(renderResult.getAllByRole('listitem', { hidden: true }).length).toBeGreaterThan(0);
      });

      const list = renderResult.getByRole('list', { hidden: true });
      const { getAllByRole: getSuggestions } = within(list);
      const suggestionItems = getSuggestions('button', { hidden: true }) as HTMLButtonElement[];

      return { suggestionItems, ...renderResult };
    };

    it('should request and render a suggestions list when typing', async () => {
      expect.assertions(5);
      const { suggestionItems } = await setupWithSuggestions();

      await waitFor(() => {
        expect(suggestionItems).toHaveLength(3);
        expect(suggestionItems[0]).toHaveTextContent('Crockery');
        expect(suggestionItems[1]).toHaveTextContent('Caster sugar');
        expect(suggestionItems[2]).toHaveTextContent('Abacus');
      });
    });

    it('should not render the suggestions list until the suggestions are loaded', async () => {
      expect.assertions(2);

      const { queryByRole } = setupToSuggestions();
      expect(queryByRole('list', { hidden: true })).not.toBeInTheDocument();

      await waitFor(() => {
        expect(queryByRole('list', { hidden: true })).toBeInTheDocument();
      });
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
      /* eslint-disable jest/prefer-expect-assertions */
      it('should change the value of the current input', async () => {
        const { inputSomeField } = await setupWithSelection();

        await waitFor(() => {
          expect(inputSomeField.value).toBe('Caster sugar');
        });
      });

      it('should focus the next input', async () => {
        const { inputSomeField, inputNextField } = await setupWithSelection();

        await waitFor(() => {
          expect(document.activeElement).toBe(inputSomeField);
        });
        await waitFor(() => {
          expect(inputSomeField.value).toBe('Caster sugar');
        });
        await waitFor(() => {
          expect(document.activeElement).toBe(inputNextField);
        });
      });
      /* eslint-enable jest/prefer-expect-assertions */

      it('should add the suggested values to the created item', async () => {
        expect.assertions(4);
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

        await waitFor(() => {
          expect(props.onCreate).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
          expect(props.onCreate).toHaveBeenCalledWith({
            someField: 'Caster sugar',
            nextField: 'Manual value',
          });
        });
      });

      describe('if on the last field of the create form', () => {
        /* eslint-disable jest/prefer-expect-assertions */
        it('should focus the add button', async () => {
          nock('http://localhost')
            .get('/api/v4/data/search/my-page/nextField/z/5')
            .matchHeader('authorization', 'some api key')
            .reply(200, {
              data: {
                list: ['Zappa', 'Zenith'],
              },
            });

          const { getAllByRole, getByRole, getByText } = setup({
            suggestionFields: ['someField', 'nextField'],
          });

          const inputs = getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];
          const addButton = getByText('Add') as HTMLButtonElement;

          const inputNextField = inputs[1];
          act(() => {
            fireEvent.change(inputNextField, {
              target: { value: 'z' },
            });
          });

          await waitFor(() => {
            expect(getAllByRole('listitem', { hidden: true }).length).toBeGreaterThan(0);
          });

          const list = getByRole('list', { hidden: true });
          const { getAllByRole: getSuggestions } = within(list);
          const suggestionItems = getSuggestions('button', { hidden: true }) as HTMLButtonElement[];

          act(() => {
            fireEvent.focus(suggestionItems[1]);
          });
          act(() => {
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
        const { inputSomeField, inputNextField } = await setupWithSelection(true, 0);

        await waitFor(() => {
          expect(inputSomeField.value).toBe('Crockery');
        });
        await waitFor(() => {
          expect(inputNextField.value).toBe('Kitchen');
        });
      });

      it('should focus the next input', async () => {
        const { inputNextField } = await setupWithSelection(true, 0);

        await waitFor(() => {
          expect(inputNextField.value).toBe('Kitchen');
        });
        await waitFor(() => {
          expect(document.activeElement).toBe(inputNextField);
          expect(inputNextField.selectionStart).toBe(0);
          expect(inputNextField.selectionEnd).toBe('Kitchen'.length);
        });
      });
      /* eslint-enable jest/prefer-expect-assertions */
    });
  });
});
