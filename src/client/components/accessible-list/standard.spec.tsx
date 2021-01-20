/* eslint-disable max-len */
import { render, RenderResult, within, act, fireEvent, waitFor } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import sinon from 'sinon';
import numericHash from 'string-hash';

import { AccessibleListStandard } from './standard';
import * as listMutationHooks from '~client/hooks/mutations/list';
import { State } from '~client/reducers';
import { breakpoints } from '~client/styled/variables';
import { testState } from '~client/test-data/state';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { PageListStandard } from '~client/types/enum';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('<AccessibleListStandard />', () => {
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

  const page: PageListStandard.Bills = PageListStandard.Bills;

  let matchMedia: MatchMediaMock;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  const state: State = {
    ...testState,
    [page]: {
      ...testState[page],
      items: [
        {
          id: numericHash('some-id'),
          date: new Date('2020-04-20'),
          item: 'item one',
          cost: 931,
        },
      ],
      __optimistic: [undefined],
      total: 1886394,
    },
  };

  const props = {
    page,
    color: 'red',
  };

  const setup = (customState: State = state): RenderResult & { store: MockStore<State> } => {
    const store = createStore<State>()(customState);
    const renderResult = render(
      <Provider store={store}>
        <GQLProviderMock>
          <AccessibleListStandard<PageListStandard.Bills> {...props} />
        </GQLProviderMock>
      </Provider>,
    );

    return { store, ...renderResult };
  };

  describe.each`
    field     | displayValue
    ${'date'} | ${'20/04/2020'}
    ${'item'} | ${'item one'}
    ${'cost'} | ${'9.31'}
  `('$field field', ({ displayValue }) => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByDisplayValue } = setup();
      expect(getByDisplayValue(displayValue)).toBeInTheDocument();
    });
  });

  it('should automatically fill the date field with the current date', () => {
    expect.assertions(3);
    const clock = sinon.useFakeTimers(new Date('2020-04-18'));
    const { getByTestId } = setup();
    const createForm = getByTestId('create-form');
    const { getAllByRole, getByText } = within(createForm);

    const inputs = getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];
    const addButton = getByText('Add') as HTMLButtonElement;

    const [dateInput, itemInput, costInput] = inputs;

    expect(dateInput.value).toBe('18/04/2020');

    act(() => {
      fireEvent.focus(itemInput);
    });
    act(() => {
      fireEvent.change(itemInput, { target: { value: 'some new item' } });
    });
    act(() => {
      fireEvent.blur(itemInput);
    });

    act(() => {
      fireEvent.focus(costInput);
    });
    act(() => {
      fireEvent.change(costInput, { target: { value: '189.93' } });
    });
    act(() => {
      fireEvent.blur(costInput);
    });

    act(() => {
      fireEvent.click(addButton);
    });

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith({
      date: new Date('2020-04-18'),
      item: 'some new item',
      cost: 18993,
    });

    clock.restore();
  });

  it('should render the total cost of the items', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const header = getByTestId('header');
    const { getByText } = within(header);
    expect(getByText('Total: £18.9k')).toBeInTheDocument();
  });

  it('should sort the items first by date, then by item', () => {
    expect.assertions(3);
    const { getAllByRole } = setup({
      ...testState,
      [page]: {
        ...testState[page],
        items: [
          {
            id: numericHash('some-id'),
            date: new Date('2020-04-20'),
            item: 'item 1',
            cost: 1,
          },
          {
            id: numericHash('other-id'),
            date: new Date('2020-04-21'),
            item: 'item 2',
            cost: 1,
          },
          {
            id: numericHash('next-id'),
            date: new Date('2020-04-20'),
            item: 'An item',
            cost: 1,
          },
        ],
        __optimistic: [undefined, undefined, undefined],
      },
    });

    const [firstItem, secondItem, thirdItem] = getAllByRole('listitem') as HTMLLIElement[];

    const { getByDisplayValue: getFirstItem } = within(firstItem);
    const { getByDisplayValue: getSecondItem } = within(secondItem);
    const { getByDisplayValue: getThirdItem } = within(thirdItem);

    expect(getFirstItem('item 2')).toBeInTheDocument();
    expect(getSecondItem('An item')).toBeInTheDocument();
    expect(getThirdItem('item 1')).toBeInTheDocument();
  });

  describe('when rendering on mobiles', () => {
    const mobileQuery = `(max-width: ${breakpoints.mobile - 1}px)`;
    const setupMobile = (): RenderResult & { store: MockStore<State> } => {
      matchMedia.useMediaQuery(mobileQuery);
      const renderResult = setup();

      return renderResult;
    };

    it('should render a mobile list view', () => {
      expect.assertions(1);
      const { container } = setupMobile();

      expect(container).toMatchInlineSnapshot(`
        .emotion-0 {
          background-color: red;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-flex-flow: column;
          -webkit-flex-flow: column;
          -ms-flex-flow: column;
          flex-flow: column;
          -webkit-flex: 1 1 0;
          -ms-flex: 1 1 0;
          flex: 1 1 0;
          min-height: 0;
        }

        @media only screen and (min-width: 500px) {
          .emotion-0 {
            background-color: #fff;
          }
        }

        .emotion-2 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          font-size: 1rem;
        }

        .emotion-4 {
          -webkit-flex: 0 0 6.5rem;
          -ms-flex: 0 0 6.5rem;
          flex: 0 0 6.5rem;
          font-weight: bold;
          height: 1.75rem;
          line-height: 1.75rem;
          padding: 0 0.25rem;
          text-align: center;
          white-space: nowrap;
        }

        @media only screen and (min-width: 500px) {
          .emotion-4 {
            -webkit-flex: 0 0 6.25rem;
            -ms-flex: 0 0 6.25rem;
            flex: 0 0 6.25rem;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: left;
          }
        }

        .emotion-6 {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          font-weight: bold;
          height: 1.75rem;
          line-height: 1.75rem;
          padding: 0 0.25rem;
          text-align: center;
          white-space: nowrap;
        }

        @media only screen and (min-width: 500px) {
          .emotion-6 {
            -webkit-flex: 0 0 9.375rem;
            -ms-flex: 0 0 9.375rem;
            flex: 0 0 9.375rem;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: left;
          }
        }

        .emotion-8 {
          -webkit-flex: 0 0 5rem;
          -ms-flex: 0 0 5rem;
          flex: 0 0 5rem;
          font-weight: bold;
          height: 1.75rem;
          line-height: 1.75rem;
          padding: 0 0.25rem;
          text-align: center;
          white-space: nowrap;
        }

        @media only screen and (min-width: 500px) {
          .emotion-8 {
            -webkit-flex: 0 0 6rem;
            -ms-flex: 0 0 6rem;
            flex: 0 0 6rem;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: left;
          }
        }

        .emotion-10 {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          padding-bottom: 3rem;
        }

        @media only screen and (min-width: 500px) {
          .emotion-10 {
            padding-bottom: 0;
          }
        }

        .emotion-12 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          height: 1.875rem;
          line-height: 1.5rem;
        }

        @media only screen and (min-width: 500px) {
          .emotion-12 {
            background-color: #eaeaea;
            border-right: 1px solid #ccc;
            height: 1.5rem;
          }

          .emotion-12 input[type='text'] {
            background-color: transparent;
            border: none;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            margin: 0;
            outline: none;
            padding: 0 0.125rem;
            width: 0;
            -webkit-flex: 1;
            -ms-flex: 1;
            flex: 1;
          }

          .emotion-12 input[type='text']:focus {
            box-shadow: inset 0 0 1px 1px #09e;
          }
        }

        .emotion-14 {
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          background: none;
          border: none;
          color: inherit;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          font: inherit;
          height: inherit;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .emotion-16 {
          -webkit-flex: 0 0 6.5rem;
          -ms-flex: 0 0 6.5rem;
          flex: 0 0 6.5rem;
          overflow: hidden;
          padding-right: 0.25rem;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .emotion-18 {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          overflow: hidden;
          padding-right: 0.25rem;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .emotion-20 {
          -webkit-flex: 0 0 5rem;
          -ms-flex: 0 0 5rem;
          flex: 0 0 5rem;
          overflow: hidden;
          padding-right: 0.25rem;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .emotion-22 {
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          background: rgba(255,255,255,0.8);
          bottom: 0;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-flex-flow: column;
          -webkit-flex-flow: column;
          -ms-flex-flow: column;
          flex-flow: column;
          height: 3rem;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
          position: absolute;
          width: 100%;
        }

        .emotion-22 button {
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          background: #000;
          border: none;
          border-radius: 0.125rem;
          color: #fff;
          font-size: 0.875rem;
          -webkit-flex: 0 0 2.625rem;
          -ms-flex: 0 0 2.625rem;
          flex: 0 0 2.625rem;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
          line-height: 2.5rem;
          padding: 0;
          margin: 0;
          text-transform: uppercase;
          width: 8rem;
        }

        .emotion-24 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          margin: 0 6px;
          -webkit-box-flex: 1;
          -webkit-flex-grow: 1;
          -ms-flex-positive: 1;
          flex-grow: 1;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
          padding: 1em 0;
          width: 100%;
          background: #ffa35c;
          font-size: 0.6em;
          border: none;
          border-radius: 3px;
          outline: none;
          text-transform: uppercase;
          font-weight: bold;
        }

        .e4ltp6k2 .emotion-24 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          margin: 0 0.2em;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
          grid-row: 1;
          grid-column: 4;
        }

        .e4ltp6k1 .emotion-24,
        .e4ltp6k1 .emotion-24:hover,
        .e4ltp6k1 .emotion-24:active {
          background: none;
          border: none;
          box-shadow: none;
        }

        .e4ltp6k1 .emotion-24::after {
          display: block;
          margin-left: 16px;
          content: '';
          width: 0;
          height: 0;
          border: solid transparent;
          border-left-color: #111;
          border-width: 6px 8px;
          transform-origin: left center;
        }

        .emotion-24:disabled {
          background: none;
        }

        @media only screen and (min-width: 500px) {
          .emotion-24 {
            display: inline-block;
            margin: 0;
            padding: 5px 12px 6px;
            -webkit-box-flex: 0;
            -webkit-flex-grow: 0;
            -ms-flex-positive: 0;
            flex-grow: 0;
            width: auto;
            box-shadow: inset 0px 1px 0px 0px rgba(0,0,0,0.2);
            background: #74ad5a;
            border: 1px solid #3b6e22;
            border-radius: 0;
            cursor: pointer;
            color: #fff;
            font-family: Arial;
            font-size: 13px;
            height: 24px;
            position: relative;
            -webkit-text-decoration: none;
            text-decoration: none;
            text-transform: none;
            z-index: 4;
          }

          .emotion-24:hover,
          .emotion-24:focus {
            background: #80be69;
          }

          .emotion-24:active {
            background: #638c4d;
          }

          .emotion-24:disabled {
            background: #9c9c9c;
            cursor: default;
            border: 1px solid #666;
          }
        }

        .e1w7s03s5 .emotion-24 {
          margin: 2px 4px;
        }

        <div>
          <div
            class="emotion-0 emotion-1"
            color="red"
          >
            <div
              class="emotion-2 emotion-3"
              data-testid="header"
              role="heading"
            >
              <div
                class="emotion-4 emotion-5"
              >
                Date
              </div>
              <div
                class="emotion-6 emotion-5"
              >
                Item
              </div>
              <div
                class="emotion-8 emotion-5"
              >
                Cost
              </div>
            </div>
            <div
              class="emotion-10 emotion-11"
              role="list"
            >
              <div>
                <div
                  style="position: relative; height: 768px; width: 1024px; overflow: auto; will-change: transform; direction: ltr;"
                >
                  <div
                    style="height: 30px; width: 100%;"
                  >
                    <li
                      class="emotion-12 emotion-13"
                      role="button"
                      style="position: absolute; left: 0px; top: 0px; height: 30px; width: 100%;"
                    >
                      <button
                        class="emotion-14 emotion-15"
                      >
                        <span
                          class="emotion-16 emotion-17"
                        >
                          20/04/2020
                        </span>
                        <span
                          class="emotion-18 emotion-17"
                        >
                          item one
                        </span>
                        <span
                          class="emotion-20 emotion-17"
                        >
                          £9.31
                        </span>
                      </button>
                    </li>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="emotion-22 emotion-23"
            >
              <button
                class="emotion-24 emotion-25"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      `);
    });

    it.each`
      field     | example
      ${'date'} | ${'20/04/2020'}
      ${'item'} | ${'item one'}
      ${'cost'} | ${'£9.31'}
    `('should render the $field field(s) correctly', ({ example }) => {
      expect.assertions(1);
      const { getByText } = setupMobile();
      expect(getByText(example)).toBeInTheDocument();
    });

    it('should not render a total cost', () => {
      expect.assertions(1);
      const { queryByText } = setupMobile();
      expect(queryByText('Total: £18.9k')).not.toBeInTheDocument();
    });

    it('should not render delete buttons', () => {
      expect.assertions(1);
      const { queryAllByText } = setupMobile();
      const deleteButtons = queryAllByText('−') as HTMLButtonElement[];
      expect(deleteButtons).toHaveLength(0);
    });

    it('should not render inputs', () => {
      expect.assertions(1);
      const { queryAllByRole } = setupMobile();
      const inputs = queryAllByRole('textbox') as HTMLInputElement[];
      expect(inputs).toHaveLength(0);
    });

    it('should not render a create form', () => {
      expect.assertions(1);
      const { queryByTestId } = setupMobile();
      expect(queryByTestId('create-form')).not.toBeInTheDocument();
    });

    describe('add button', () => {
      it('should be rendered', () => {
        expect.assertions(1);
        const { getByText } = setupMobile();
        const addButton = getByText('Add');
        expect(addButton).toBeInTheDocument();
      });

      it('should open a modal dialog', () => {
        expect.assertions(4);
        const { getByText, queryByTestId, getByTestId } = setupMobile();
        const addButton = getByText('Add');
        expect(queryByTestId('modal-dialog')).not.toBeInTheDocument();

        act(() => {
          fireEvent.click(addButton);
        });

        const modalDialog = getByTestId('modal-dialog');
        expect(modalDialog).toBeInTheDocument();

        const { queryByText: queryModalText } = within(modalDialog);
        expect(queryModalText('Add item')).toBeInTheDocument();
        expect(queryModalText('−')).not.toBeInTheDocument();
      });

      it('should create an item', async () => {
        expect.assertions(3);
        const clock = sinon.useFakeTimers(new Date('2020-04-14'));
        const { getByText, getByTestId, queryByTestId } = setupMobile();
        const addButton = getByText('Add');
        act(() => {
          fireEvent.click(addButton);
        });
        const modalDialog = getByTestId('modal-dialog');
        const { getByRole, getByDisplayValue, getByText: getModalText } = within(modalDialog);

        const dateInput = getByDisplayValue('2020-04-14') as HTMLInputElement;
        const itemInput = getByRole('textbox') as HTMLInputElement;
        const costInput = getByRole('spinbutton') as HTMLInputElement;

        act(() => {
          fireEvent.change(dateInput, { target: { value: '2020-04-20' } });
        });
        act(() => {
          fireEvent.blur(dateInput);
        });
        act(() => {
          fireEvent.change(itemInput, { target: { value: 'some new item' } });
        });
        act(() => {
          fireEvent.blur(itemInput);
        });
        act(() => {
          fireEvent.change(costInput, { target: { value: '23.65' } });
        });
        act(() => {
          fireEvent.blur(costInput);
        });

        const buttonConfirm = getModalText('Do it.') as HTMLButtonElement;
        act(() => {
          fireEvent.click(buttonConfirm);
        });

        expect(onCreate).toHaveBeenCalledTimes(1);
        expect(onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            date: new Date('2020-04-20'),
            item: 'some new item',
            cost: 2365,
          }),
        );

        act(() => {
          clock.runAll();
        });

        await waitFor(() => {
          expect(queryByTestId('modal-dialog')).not.toBeInTheDocument();
        });

        clock.restore();
      });
    });

    describe('edit dialog', () => {
      it('should be rendered when clicking an item', () => {
        expect.assertions(3);
        const { getByText, getByTestId } = setupMobile();
        const itemField = getByText('item one');

        act(() => {
          fireEvent.click(itemField);
        });

        const modalDialog = getByTestId('modal-dialog');
        expect(modalDialog).toBeInTheDocument();

        const { queryByText: queryModalText } = within(modalDialog);
        expect(queryModalText(`Editing id#${numericHash('some-id')}`)).toBeInTheDocument();
        expect(queryModalText('−')).toBeInTheDocument();
      });

      it('should update an item', () => {
        expect.assertions(2);
        const clock = sinon.useFakeTimers(new Date('2020-04-29'));

        const { getByText, getByTestId } = setupMobile();
        const itemField = getByText('item one');
        act(() => {
          fireEvent.click(itemField);
        });
        const modalDialog = getByTestId('modal-dialog');
        const { getByRole, getByDisplayValue, getByText: getModalText } = within(modalDialog);

        const dateInput = getByDisplayValue('2020-04-20') as HTMLInputElement;
        const itemInput = getByRole('textbox') as HTMLInputElement;
        const costInput = getByRole('spinbutton') as HTMLInputElement;

        act(() => {
          fireEvent.change(dateInput, { target: { value: '2020-04-23' } });
        });
        act(() => {
          fireEvent.blur(dateInput);
        });
        act(() => {
          fireEvent.change(itemInput, { target: { value: 'updated item' } });
        });
        act(() => {
          fireEvent.blur(itemInput);
        });
        act(() => {
          fireEvent.change(costInput, { target: { value: '998.31' } });
        });
        act(() => {
          fireEvent.blur(costInput);
        });

        const buttonConfirm = getModalText('Do it.') as HTMLButtonElement;
        act(() => {
          fireEvent.click(buttonConfirm);
        });

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith(
          numericHash('some-id'),
          expect.objectContaining({
            date: new Date('2020-04-23'),
            item: 'updated item',
            cost: 99831,
          }),
          expect.objectContaining({
            date: new Date('2020-04-20'),
            item: 'item one',
            cost: 931,
          }),
        );

        clock.restore();
      });

      it('should delete an item', () => {
        expect.assertions(2);
        const { getByText, getByTestId } = setupMobile();
        const itemField = getByText('item one');
        act(() => {
          fireEvent.click(itemField);
        });
        const modalDialog = getByTestId('modal-dialog');
        const { getByText: getModalText } = within(modalDialog);

        const buttonDelete = getModalText('−') as HTMLButtonElement;
        act(() => {
          fireEvent.click(buttonDelete);
        });

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(numericHash('some-id'), {
          id: numericHash('some-id'),
          date: new Date('2020-04-20'),
          item: 'item one',
          cost: 931,
        });
      });
    });
  });
});
