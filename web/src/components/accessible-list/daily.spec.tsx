import { render, RenderResult, within, act, fireEvent } from '@testing-library/react';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import { Provider } from 'react-redux';
import createStore, { MockStore } from 'redux-mock-store';

import { AccessibleListDaily } from './daily';
import { listItemUpdated } from '~client/actions/list';
import { State } from '~client/reducers';
import { DailyState } from '~client/reducers/list';
import { breakpoints } from '~client/styled/variables';
import { testState } from '~client/test-data/state';
import { Page, ListItem } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('<AccessibleListDaily />', () => {
  const page = Page.food;

  const state: State = {
    ...testState,
    [page]: {
      ...testState[page],
      items: [
        {
          id: 'id-1',
          date: new Date('2020-04-17'),
          item: 'item one',
          category: 'category one',
          cost: 931,
          shop: 'shop one',
        },
        {
          id: 'id-2',
          date: new Date('2020-04-20'),
          item: 'item two',
          category: 'category two',
          cost: 118,
          shop: 'shop two',
        },
        {
          id: 'id-3',
          date: new Date('2020-04-20'),
          item: 'item three',
          category: 'category three',
          cost: 173,
          shop: 'shop three',
        },
      ],
      total: 665984,
    },
  };

  let matchMedia: MatchMediaMock;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  const setup = (): RenderResult & { store: MockStore<State> } => {
    const store = createStore<State>()(state);
    const renderResult = render(
      <Provider store={store}>
        <AccessibleListDaily page={page} />
      </Provider>,
    );

    return { store, ...renderResult };
  };

  describe.each`
    id        | date            | item            | category            | cost      | shop
    ${'id-3'} | ${'20/04/2020'} | ${'item three'} | ${'category three'} | ${'1.73'} | ${'shop three'}
    ${'id-2'} | ${'20/04/2020'} | ${'item two'}   | ${'category two'}   | ${'1.18'} | ${'shop two'}
    ${'id-1'} | ${'17/04/2020'} | ${'item one'}   | ${'category one'}   | ${'9.31'} | ${'shop one'}
  `('item with id $id', ({ date, item, category, cost, shop }) => {
    describe.each`
      field         | displayValue
      ${'date'}     | ${date}
      ${'item'}     | ${item}
      ${'category'} | ${category}
      ${'cost'}     | ${cost}
      ${'shop'}     | ${shop}
    `('$field field', ({ displayValue }) => {
      it('should be rendered', () => {
        expect.assertions(1);
        const { getAllByDisplayValue } = setup();
        expect(getAllByDisplayValue(displayValue).length).toBeGreaterThan(0);
      });
    });
  });

  it.each`
    header
    ${'Date'}
    ${'Item'}
    ${'Category'}
    ${'Cost'}
    ${'Shop'}
  `('should render the $header header column', ({ header }) => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const headerDom = getByTestId('header');
    const { getByText } = within(headerDom);
    expect(getByText(header)).toBeInTheDocument();
  });

  it('should render the total cost header', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const header = getByTestId('header');
    const { getByText } = within(header);
    expect(getByText('Total: £6.7k')).toBeInTheDocument();
  });

  it('should render the weekly cost header', () => {
    expect.assertions(1);
    const { getByTestId } = setup();
    const header = getByTestId('header');
    const { getByText } = within(header);
    // weekly cost: (931 + 118 + 173) / (3 / 7) = 2851.3333
    expect(getByText('Weekly: £28.51')).toBeInTheDocument();
  });

  describe.each`
    index | date            | total
    ${1}  | ${'20/04/2020'} | ${'£2.91'}
    ${2}  | ${'17/04/2020'} | ${'£9.31'}
  `('daily totals for $date', ({ total, index }) => {
    it('should be rendered on the correct row', () => {
      expect.assertions(1);
      const { getAllByRole } = setup();
      const rows = getAllByRole('listitem') as HTMLLIElement[];
      const { getByText } = within(rows[index]);
      expect(getByText(total)).toBeInTheDocument();
    });

    it('should only be rendered on one row', () => {
      expect.assertions(1);
      const { getAllByText } = setup();
      expect(getAllByText(total)).toHaveLength(1);
    });
  });

  describe('if a custom category field name is given', () => {
    const customPage = 'myPage';
    const customCategory = 'myCategory';

    type CustomItem = ListItem & {
      [customCategory]: string;
      shop: string;
    };

    type CustomState = {
      [customPage]: DailyState<CustomItem>;
    };

    const customState: CustomState = {
      [customPage]: {
        items: [
          {
            id: 'id-1',
            date: new Date('2020-04-17'),
            item: 'item one',
            [customCategory]: 'category one',
            cost: 931,
            shop: 'shop one',
          },
        ],
        total: 1023,
        olderExists: null,
      },
    };

    const setupCustom = (): RenderResult & { store: MockStore<CustomState> } => {
      const store = createStore<CustomState>()(customState);
      const renderResult = render(
        <Provider store={store}>
          <AccessibleListDaily<typeof customPage, typeof customCategory>
            page={customPage}
            category={customCategory}
          />
        </Provider>,
      );

      return { store, ...renderResult };
    };

    it('should render the category field', () => {
      expect.assertions(1);
      const { getByDisplayValue } = setupCustom();
      expect(getByDisplayValue('category one')).toBeInTheDocument();
    });

    it('should dispatch the right update action', () => {
      expect.assertions(1);
      const { store, getByDisplayValue } = setupCustom();
      const input = getByDisplayValue('category one') as HTMLInputElement;

      act(() => {
        fireEvent.focus(input);
      });
      act(() => {
        fireEvent.change(input, { target: { value: 'updated category' } });
      });
      act(() => {
        fireEvent.blur(input);
      });

      const expectedAction = listItemUpdated<CustomItem, typeof customPage>(customPage)(
        'id-1',
        {
          [customCategory]: 'updated category',
        },
        {
          id: 'id-1',
          date: new Date('2020-04-17'),
          item: 'item one',
          [customCategory]: 'category one',
          cost: 931,
          shop: 'shop one',
        },
      );

      expect(store.getActions()).toStrictEqual([expect.objectContaining(expectedAction)]);
    });
  });

  describe('when rendering on mobiles', () => {
    const mobileQuery = `(max-width: ${breakpoints.mobile - 1}px)`;
    const setupMobile = (): RenderResult & { store: MockStore<State> } => {
      matchMedia.useMediaQuery(mobileQuery);
      const renderResult = setup();

      return renderResult;
    };

    it.each`
      item             | value
      ${'weekly cost'} | ${'Weekly: £28.51'}
      ${'category'}    | ${'Category'}
      ${'shop'}        | ${'Shop'}
    `('should not render the $item header', ({ value }) => {
      expect.assertions(1);
      const { getByTestId } = setupMobile();
      const header = getByTestId('header');
      const { queryByText } = within(header);
      expect(queryByText(value)).not.toBeInTheDocument();
    });

    it('should not render daily totals', () => {
      expect.assertions(2);
      const { queryByText, queryAllByText } = setupMobile();
      expect(queryByText('£2.91')).not.toBeInTheDocument();
      expect(queryAllByText('£9.31')).toHaveLength(1);
    });
  });
});
