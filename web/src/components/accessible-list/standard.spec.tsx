import { render, RenderResult, within, act, fireEvent, waitFor } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';
import sinon from 'sinon';

import { AccessibleListStandard } from './standard';
import { listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions/list';
import { State } from '~client/reducers';
import { breakpoints } from '~client/styled/variables';
import { testState } from '~client/test-data/state';
import { Page, ListCalcItem } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('<AccessibleListStandard />', () => {
  const page: Page.bills = Page.bills;

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
          id: 'some-id',
          date: new Date('2020-04-20'),
          item: 'item one',
          cost: 931,
        },
      ],
      total: 1886394,
    },
  };

  const props = {
    page,
    color: 'red',
  };

  const setup = (): RenderResult & { store: MockStore<State> } => {
    const store = createStore<State>()(state);
    const renderResult = render(
      <Provider store={store}>
        <AccessibleListStandard<Page.bills> {...props} />
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
    expect.assertions(2);
    const clock = sinon.useFakeTimers(new Date('2020-04-18'));
    const { getByTestId, store } = setup();
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

    const expectedAction = listItemCreated<ListCalcItem, Page.bills>(page)({
      date: new Date('2020-04-18'),
      item: 'some new item',
      cost: 18993,
    });

    expect(store.getActions()).toStrictEqual(expect.arrayContaining([expectedAction]));

    clock.restore();
  });

  it('should render the total cost of the items', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const header = getByTestId('header');
    const { getByText } = within(header);
    expect(getByText('Total: £18.9k')).toBeInTheDocument();
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
        .c8 {
          -webkit-flex: 0 0 6.5rem;
          -ms-flex: 0 0 6.5rem;
          flex: 0 0 6.5rem;
          overflow: hidden;
          padding-right: 0.25rem;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .c9 {
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          overflow: hidden;
          padding-right: 0.25rem;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .c10 {
          -webkit-flex: 0 0 5rem;
          -ms-flex: 0 0 5rem;
          flex: 0 0 5rem;
          overflow: hidden;
          padding-right: 0.25rem;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .c11 {
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
          -webkit-flex-flow: column;
          -ms-flex-flow: column;
          flex-flow: column;
          height: 3rem;
          -webkit-box-pack: center;
          -webkit-justify-content: center;
          -ms-flex-pack: center;
          justify-content: center;
          position: absolute;
          width: 100%;
        }

        .c11 button {
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
          -webkit-justify-content: center;
          -ms-flex-pack: center;
          justify-content: center;
          line-height: 2.5rem;
          padding: 0;
          margin: 0;
          text-transform: uppercase;
          width: 8rem;
        }

        .c7 {
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

        .c0 {
          background-color: red;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex-flow: column;
          -ms-flex-flow: column;
          flex-flow: column;
          -webkit-flex: 1 1 0;
          -ms-flex: 1 1 0;
          flex: 1 1 0;
          min-height: 0;
        }

        .c2 {
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

        .c3 {
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

        .c4 {
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

        .c5 {
          list-style: none;
          margin: 0;
          padding: 0;
          -webkit-flex: 1 1 0;
          -ms-flex: 1 1 0;
          flex: 1 1 0;
          margin: 0;
          min-height: 0;
          overflow-y: auto;
          padding: 0 0 3rem 0;
        }

        .c1 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          font-size: 1rem;
        }

        .c6 {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          height: 1.875rem;
        }

        .c12 {
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
          -webkit-justify-content: center;
          -ms-flex-pack: center;
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

        .sc-fznMAR .c12 {
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
          -webkit-justify-content: center;
          -ms-flex-pack: center;
          justify-content: center;
          grid-row: 1;
          grid-column: 4;
        }

        .sc-fznWOq .c12,
        .sc-fznWOq .c12:hover,
        .sc-fznWOq .c12:active {
          background: none;
          border: none;
          box-shadow: none;
        }

        .sc-fznWOq .c12::after {
          display: block;
          margin-left: 16px;
          content: '';
          width: 0;
          height: 0;
          border: solid transparent;
          border-left-color: #111;
          border-width: 6px 8px;
          -webkit-transform-origin: left center;
          -ms-transform-origin: left center;
          transform-origin: left center;
        }

        .c12:disabled {
          background: none;
        }

        .sc-fzoYHE .c12 {
          margin: 2px 4px;
        }

        @media only screen and (min-width:690px) {
          .c0 {
            background-color: #fff;
          }
        }

        @media only screen and (min-width:690px) {
          .c2 {
            -webkit-flex: 0 0 6.25rem;
            -ms-flex: 0 0 6.25rem;
            flex: 0 0 6.25rem;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: left;
          }
        }

        @media only screen and (min-width:690px) {
          .c3 {
            -webkit-flex: 0 0 11.25rem;
            -ms-flex: 0 0 11.25rem;
            flex: 0 0 11.25rem;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: left;
          }
        }

        @media only screen and (min-width:690px) {
          .c4 {
            -webkit-flex: 0 0 6rem;
            -ms-flex: 0 0 6rem;
            flex: 0 0 6rem;
            border-right: 1px solid #ccc;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: left;
          }
        }

        @media only screen and (min-width:690px) {
          .c5 {
            padding-bottom: 0;
          }
        }

        @media only screen and (min-width:690px) {
          .c6 {
            border-right: 1px solid #ccc;
            height: 1.5rem;
          }

          .c6:nth-child(2n) {
            background-color: #eaeaea;
          }

          .c6 input[type='text'] {
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

          .c6 input[type='text']:focus {
            box-shadow: inset 0 0 1px 1px #09e;
          }
        }

        @media only screen and (min-width:690px) {
          .c12 {
            display: inline-block;
            margin: 0;
            padding: 5px 12px 6px;
            -webkit-box-flex: 0;
            -webkit-flex-grow: 0;
            -ms-flex-positive: 0;
            flex-grow: 0;
            width: auto;
            box-shadow: inset 0px 1px 0px 0px;
            background: linear-gradient(to bottom,#68a54b 5%,#74ad5a 100%);
            background-color: #68a54b;
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

          .c12:hover {
            background-color: #74ad5a;
            background-image: linear-gradient( to bottom, #74ad5a 5%, #68a54b 100% );
          }

          .c12:active {
            top: 1px;
            background: $color-button-active;
          }

          .c12:focus {
            box-shadow: 0 2px 3px rgba(0,0,0,0.3);
          }

          .c12:disabled {
            background: #9c9c9c;
            cursor: default;
            border: 1px solid #666;
          }
        }

        <div>
          <div
            class="c0"
            color="red"
          >
            <div
              class="c1"
              data-testid="header"
              role="heading"
            >
              <div
                class="c2"
              >
                Date
              </div>
              <div
                class="c3"
              >
                Item
              </div>
              <div
                class="c4"
              >
                Cost
              </div>
            </div>
            <ul
              class="sc-fzoLsD c5"
            >
              <li
                class="sc-fznKkj c6"
                role="button"
              >
                <button
                  class="c7"
                >
                  <span
                    class="c8"
                  >
                    20/04/2020
                  </span>
                  <span
                    class="c9"
                  >
                    item one
                  </span>
                  <span
                    class="c10"
                  >
                    £9.31
                  </span>
                </button>
              </li>
            </ul>
            <div
              class="c11"
            >
              <button
                class="c12"
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
        expect.assertions(2);
        const clock = sinon.useFakeTimers(new Date('2020-04-14'));
        const { getByText, getByTestId, queryByTestId, store } = setupMobile();
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

        expect(store.getActions()).toStrictEqual([
          expect.objectContaining(
            listItemCreated<ListCalcItem, Page.bills>(page)(
              expect.objectContaining({
                date: new Date('2020-04-20'),
                item: 'some new item',
                cost: 2365,
              }),
            ),
          ),
        ]);

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
        expect(queryModalText('Editing id#some-id')).toBeInTheDocument();
        expect(queryModalText('−')).toBeInTheDocument();
      });

      it('should update an item', () => {
        expect.assertions(1);
        const clock = sinon.useFakeTimers(new Date('2020-04-29'));

        const { getByText, getByTestId, store } = setupMobile();
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

        expect(store.getActions()).toStrictEqual([
          expect.objectContaining(
            listItemUpdated<ListCalcItem, Page.bills>(Page.bills)(
              'some-id',
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
            ),
          ),
        ]);

        clock.restore();
      });

      it('should delete an item', () => {
        expect.assertions(1);
        const { getByText, getByTestId, store } = setupMobile();
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

        expect(store.getActions()).toStrictEqual([
          expect.objectContaining(
            listItemDeleted<ListCalcItem, Page.bills>(Page.bills)('some-id', {
              id: 'some-id',
              date: new Date('2020-04-20'),
              item: 'item one',
              cost: 931,
            }),
          ),
        ]);
      });
    });
  });
});
