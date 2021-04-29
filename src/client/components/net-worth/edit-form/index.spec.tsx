import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import type { DocumentNode } from 'graphql';
import React from 'react';
import sinon from 'sinon';
import numericHash from 'string-hash';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { NetWorthEditForm, NetWorthAddForm, PropsEdit, PropsAdd } from '.';
import * as QueryExchangeRates from '~client/gql/queries/exchange-rates';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import type { Create, Id, NetWorthEntryNative as NetWorthEntry } from '~client/types';
import { NetWorthCategoryType } from '~client/types/enum';
import {
  NetWorthCategory,
  NetWorthSubcategory,
  NetWorthValueInput,
  Query,
  QueryExchangeRatesArgs,
} from '~client/types/gql';

const categories: NetWorthCategory[] = [
  {
    id: numericHash('fake-category-id-my-assets'),
    category: 'My assets',
    type: NetWorthCategoryType.Asset,
    color: 'green',
    isOption: false,
  },
  {
    id: numericHash('fake-category-id-my-options'),
    category: 'My options',
    type: NetWorthCategoryType.Asset,
    color: 'orange',
    isOption: true,
  },
  {
    id: numericHash('fake-category-id-my-liabilities'),
    category: 'My liabilities',
    type: NetWorthCategoryType.Liability,
    color: 'red',
    isOption: false,
  },
  {
    id: numericHash('fake-category-id-my-mortgage'),
    category: 'Mortgage',
    type: NetWorthCategoryType.Liability,
    color: 'darkred',
    isOption: false,
  },
];

const subcategories: NetWorthSubcategory[] = [
  {
    id: numericHash('fake-subcategory-id-bank-account'),
    categoryId: numericHash('fake-category-id-my-assets'),
    subcategory: 'My bank account',
    hasCreditLimit: null,
    opacity: 1,
  },
  {
    id: numericHash('fake-subcategory-id-some-share'),
    categoryId: numericHash('fake-category-id-my-options'),
    subcategory: 'Some share',
    hasCreditLimit: null,
    opacity: 1,
  },
  {
    id: numericHash('fake-subcategory-id-cc'),
    categoryId: numericHash('fake-category-id-my-liabilities'),
    subcategory: 'My credit card',
    hasCreditLimit: true,
    opacity: 0.9,
  },
  {
    id: numericHash('fake-subcategory-id-my-mortgage'),
    categoryId: numericHash('fake-category-id-my-mortgage'),
    subcategory: 'My house mortgage',
    hasCreditLimit: false,
    opacity: 0.78,
  },
];

describe('Net worth entry form', () => {
  const now = new Date('2020-06-03');
  const oldDate = '2020-04-20';
  const newDate = '2020-04-24';

  let clock: sinon.SinonFakeTimers;
  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });
  afterEach(() => {
    clock.restore();
  });

  const propsBase = {
    categories,
    subcategories,
    setActiveId: jest.fn(),
  };

  const item: NetWorthEntry = {
    id: numericHash('some-fake-id'),
    date: new Date(oldDate),
    values: [
      {
        subcategory: numericHash('fake-subcategory-id-bank-account'),
        simple: 385610,
      },
      {
        subcategory: numericHash('fake-subcategory-id-some-share'),
        option: {
          units: 1326,
          vested: 0,
          strikePrice: 1350.2,
          marketPrice: 1899.19,
        },
      },
      {
        subcategory: numericHash('fake-subcategory-id-cc'),
        simple: -21054,
        skip: false,
      },
      {
        subcategory: numericHash('fake-subcategory-id-my-mortgage'),
        loan: {
          principal: 16877654,
          paymentsRemaining: 176,
          rate: 1.65,
        },
        skip: false,
      },
    ],
    creditLimit: [
      {
        subcategory: numericHash('fake-subcategory-id-cc'),
        value: 650000,
      },
    ],
    currencies: [
      {
        currency: 'EUR',
        rate: 0.84,
      },
    ],
  };

  const mockGQLClient = ({
    executeQuery: ({
      variables,
      query,
    }: {
      variables: Record<string, unknown>;
      query: DocumentNode;
    }) => {
      if (
        query === QueryExchangeRates.ExchangeRates &&
        (variables as QueryExchangeRatesArgs).base === 'GBP'
      ) {
        return fromValue<{ data: Query }>({
          data: {
            exchangeRates: {
              error: null,
              rates: [
                { currency: 'GBP', rate: 1 },
                { currency: 'USD', rate: 1.39 },
                { currency: 'EUR', rate: 1.15 },
              ],
            },
          },
        });
      }

      return fromValue({
        data: null,
      });
    },
  } as unknown) as Client;

  const renderWithMocks = (children: React.ReactElement): RenderResult =>
    render(<GQLProviderMock client={mockGQLClient}>{children}</GQLProviderMock>);

  const updateDate = ({ getByLabelText, getByText }: RenderResult, setNewDate = true): void => {
    const inputDate = getByLabelText('entry-date');
    const buttonNext = getByText('Next');

    expect(inputDate).toBeInTheDocument();
    expect(buttonNext).toBeInTheDocument();

    if (setNewDate) {
      act(() => {
        fireEvent.change(inputDate, { target: { value: newDate } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
    }
    act(() => {
      fireEvent.click(buttonNext);
    });
  };

  const updateCurrencyManually = ({ getByDisplayValue, getByText }: RenderResult): void => {
    const inputEUR = getByDisplayValue('0.84');
    const buttonNext = getByText('Next');

    expect(inputEUR).toBeInTheDocument();
    expect(buttonNext).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputEUR, { target: { value: '0.876' } });
    });
    act(() => {
      fireEvent.blur(inputEUR);
    });

    act(() => {
      fireEvent.click(buttonNext);
    });
  };

  const updateAssets = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    const sectionCategoryMyAssets = getByText('My assets');
    const inputMyBankBefore = queryByDisplayValue('3856.1');
    const buttonNext = getByText('Next');

    expect(sectionCategoryMyAssets).toBeInTheDocument();
    expect(inputMyBankBefore).not.toBeInTheDocument();
    expect(buttonNext).toBeInTheDocument();

    act(() => {
      fireEvent.click(sectionCategoryMyAssets);
    });

    const inputMyBank = getByDisplayValue('3856.10');
    expect(inputMyBank).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputMyBank, { target: { value: '4000.12' } });
    });
    act(() => {
      fireEvent.blur(inputMyBank);
    });
  };

  const updateOptions = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    const sectionCategoryMyOptions = getByText('My options');
    const inputMyOptionUnitsBefore = queryByDisplayValue('1326');
    const inputMyOptionStrikeBefore = queryByDisplayValue('1350.2');
    const inputMyOptionMarketBefore = queryByDisplayValue('1899.19');

    const buttonNext = getByText('Next');

    expect(sectionCategoryMyOptions).toBeInTheDocument();
    expect(inputMyOptionUnitsBefore).not.toBeInTheDocument();
    expect(inputMyOptionStrikeBefore).not.toBeInTheDocument();
    expect(inputMyOptionMarketBefore).not.toBeInTheDocument();

    expect(buttonNext).toBeInTheDocument();

    act(() => {
      fireEvent.click(sectionCategoryMyOptions);
    });

    const inputMyOptionUnits = getByDisplayValue('1326');
    const inputMyOptionStrike = getByDisplayValue('1350.2');
    const inputMyOptionMarket = getByDisplayValue('1899.19');

    expect(inputMyOptionUnits).toBeInTheDocument();
    expect(inputMyOptionStrike).toBeInTheDocument();
    expect(inputMyOptionMarket).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputMyOptionUnits, { target: { value: '1006' } });
    });
    act(() => {
      fireEvent.blur(inputMyOptionUnits);
    });

    act(() => {
      fireEvent.change(inputMyOptionStrike, { target: { value: '1440.2' } });
    });
    act(() => {
      fireEvent.blur(inputMyOptionStrike);
    });

    act(() => {
      fireEvent.change(inputMyOptionMarket, { target: { value: '2093.7' } });
    });
    act(() => {
      fireEvent.blur(inputMyOptionMarket);
    });

    act(() => {
      fireEvent.click(buttonNext);
    });
  };

  const updateMortgage = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    const sectionCategoryMyMortgage = getByText('Mortgage');
    const inputMyMortgagePrincipalBefore = queryByDisplayValue('168776.54');
    const inputMyMortgagePaymentsRemainingBefore = queryByDisplayValue('176');
    const inputMyMortgageRateBefore = queryByDisplayValue('1.65');

    expect(sectionCategoryMyMortgage).toBeInTheDocument();
    expect(inputMyMortgagePrincipalBefore).not.toBeInTheDocument();
    expect(inputMyMortgagePaymentsRemainingBefore).not.toBeInTheDocument();
    expect(inputMyMortgageRateBefore).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(sectionCategoryMyMortgage);
    });

    const inputMyMortgagePrincipal = getByDisplayValue('168776.54');
    const inputMyMortgagePaymentsRemaining = getByDisplayValue('176');
    const inputMyMortgageRate = getByDisplayValue('1.65');

    expect(inputMyMortgagePrincipal).toBeInTheDocument();
    expect(inputMyMortgagePaymentsRemaining).toBeInTheDocument();
    expect(inputMyMortgageRate).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputMyMortgagePrincipal, { target: { value: '155998.23' } });
    });
    act(() => {
      fireEvent.blur(inputMyMortgagePrincipal);
    });

    act(() => {
      fireEvent.change(inputMyMortgagePaymentsRemaining, { target: { value: '175' } });
    });
    act(() => {
      fireEvent.blur(inputMyMortgagePaymentsRemaining);
    });

    act(() => {
      fireEvent.change(inputMyMortgageRate, { target: { value: '1.69' } });
    });
    act(() => {
      fireEvent.blur(inputMyMortgageRate);
    });
  };

  const updateCurrencyAutomatically = ({
    getByDisplayValue,
    getByText,
    getAllByText,
  }: RenderResult): void => {
    const inputEUR = getByDisplayValue('0.84') as HTMLInputElement;
    const refreshButtons = getAllByText('↻');
    const buttonNext = getByText('Next');

    expect(inputEUR).toBeInTheDocument();
    expect(refreshButtons).toHaveLength(2);

    expect(buttonNext).toBeInTheDocument();

    act(() => {
      fireEvent.click(refreshButtons[0]);
    });
    act(() => {
      clock.tick(101);
    });

    expect(inputEUR.value).toBe(`${1 / 1.15}`);

    act(() => {
      fireEvent.click(buttonNext);
    });
  };

  const updateLiabilities = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    const sectionCategoryMyLiabilities = getByText('My liabilities');
    const inputMyCCBefore = queryByDisplayValue('-210.54');
    const buttonFinish = getByText('Finish');

    expect(sectionCategoryMyLiabilities).toBeInTheDocument();
    expect(inputMyCCBefore).not.toBeInTheDocument();
    expect(buttonFinish).toBeInTheDocument();

    act(() => {
      fireEvent.click(sectionCategoryMyLiabilities);
    });

    const inputMyCC = getByDisplayValue('-210.54');
    expect(inputMyCC).toBeInTheDocument();

    const inputCreditLimit = getByDisplayValue('6500.00');
    expect(inputCreditLimit).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputMyCC, { target: { value: '-159.01' } });
    });
    act(() => {
      fireEvent.blur(inputMyCC);
    });
    act(() => {
      fireEvent.change(inputCreditLimit, { target: { value: '6000' } });
    });
    act(() => {
      fireEvent.blur(inputCreditLimit);
    });
    act(() => {
      fireEvent.click(buttonFinish);
    });
  };

  describe('<NetWorthEditForm />', () => {
    const props: PropsEdit = {
      ...propsBase,
      item,
      onUpdate: jest.fn(),
    };

    describe('when initially opened', () => {
      it('should start on the date step', () => {
        expect.assertions(1);
        const { getByText } = renderWithMocks(<NetWorthEditForm {...props} />);
        const title = getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });

      it('should move to the currencies step when hitting next', () => {
        expect.assertions(4);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateDate(renderProps);

        expect(props.onUpdate).not.toHaveBeenCalled();

        const title = renderProps.getByText(`Currencies - ${newDate}`);
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the currencies step', () => {
      it('should move to the assets step when hitting next', () => {
        expect.assertions(5);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);

        const title = renderProps.getByText('Assets');
        expect(title).toBeInTheDocument();
      });

      it('should move back to the date step when hitting previous', () => {
        expect.assertions(4);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateDate(renderProps);

        const prevButton = renderProps.getByText('Previous') as HTMLButtonElement;
        expect(prevButton).toBeInTheDocument();

        act(() => {
          fireEvent.click(prevButton);
        });

        const title = renderProps.getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the assets step', () => {
      it('should move to the liabilities step when hitting next', () => {
        expect.assertions(17);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);

        const title = renderProps.getByText('Liabilities');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the liabilities step', () => {
      let renderProps: RenderResult;

      const setup = (): void => {
        renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateMortgage(renderProps);
        updateLiabilities(renderProps);
      };

      it('should call onUpdate when hitting finish', () => {
        expect.assertions(31);
        setup();
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          {
            date: new Date(newDate),
            values: expect.arrayContaining<NetWorthValueInput>([
              {
                subcategory: numericHash('fake-subcategory-id-bank-account'),
                simple: 400012,
                skip: null,
                fx: null,
                option: null,
                loan: null,
              },
              {
                subcategory: numericHash('fake-subcategory-id-cc'),
                simple: -15901,
                skip: false,
                fx: null,
                option: null,
                loan: null,
              },
              {
                subcategory: numericHash('fake-subcategory-id-some-share'),
                option: {
                  units: 1006,
                  vested: 0,
                  strikePrice: 1440.2,
                  marketPrice: 2093.7,
                },
                skip: null,
                simple: null,
                fx: null,
                loan: null,
              },
              {
                subcategory: numericHash('fake-subcategory-id-my-mortgage'),
                loan: {
                  principal: 15599823,
                  paymentsRemaining: 175,
                  rate: 1.69,
                },
                skip: false,
                simple: null,
                fx: null,
                option: null,
              },
            ]),
            creditLimit: [
              {
                subcategory: numericHash('fake-subcategory-id-cc'),
                value: 600000,
              },
            ],
            currencies: [
              {
                currency: 'EUR',
                rate: 1 / 1.15,
              },
            ],
          },
        );
      });

      it('should reset the active ID', () => {
        expect.assertions(31);
        setup();
        expect(props.setActiveId).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('<NetWorthAddForm />', () => {
    const props: PropsAdd = {
      ...propsBase,
      data: [item],
      onCreate: jest.fn(),
      setActiveId: jest.fn(),
    };

    describe('when initially opened', () => {
      it('should start on the date step', () => {
        expect.assertions(1);
        const { getByText } = renderWithMocks(<NetWorthAddForm {...props} />);
        const title = getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });

      it('should move to the currencies step when hitting next', () => {
        expect.assertions(4);
        const renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps);

        expect(props.onCreate).not.toHaveBeenCalled();

        const title = renderProps.getByText(`Currencies - ${newDate}`);
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the currencies step', () => {
      it('should move to the assets step when hitting next', () => {
        expect.assertions(5);
        const renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);

        const title = renderProps.getByText('Assets');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the assets step', () => {
      it('should move to the liabilities step when hitting next', () => {
        expect.assertions(17);
        const renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);

        const title = renderProps.getByText('Liabilities');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the liabilities step', () => {
      let renderProps: RenderResult;

      const setup = (): void => {
        renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateMortgage(renderProps);
        updateLiabilities(renderProps);
      };

      it('should call onCreate when hitting finish', async () => {
        expect.assertions(31);
        setup();
        expect(props.onCreate).toHaveBeenCalledWith<[Create<NetWorthEntry>]>(
          expect.objectContaining<Partial<Create<NetWorthEntry>>>({
            date: new Date(newDate),
            values: expect.arrayContaining([
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-bank-account'),
                simple: 400012,
                skip: null,
              }),
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-some-share'),
                option: {
                  units: 1006,
                  vested: 0,
                  strikePrice: 1440.2,
                  marketPrice: 2093.7,
                },
                skip: null,
              }),
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-cc'),
                simple: -15901,
                skip: false,
              }),
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-my-mortgage'),
                loan: {
                  principal: 15599823,
                  paymentsRemaining: 175,
                  rate: 1.69,
                },
                skip: false,
              }),
            ]),
            creditLimit: [
              {
                subcategory: numericHash('fake-subcategory-id-cc'),
                value: 600000,
              },
            ],
            currencies: [
              expect.objectContaining({
                currency: 'EUR',
                rate: 1 / 1.15,
              }),
            ],
          }),
        );
      });

      it('should reset the active ID', () => {
        expect.assertions(31);
        setup();
        expect(props.setActiveId).toHaveBeenCalledWith(null);
      });
    });

    describe('if a date is not entered', () => {
      it('should use the end date of the next month', () => {
        expect.assertions(24);
        const renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps, false);
        updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateLiabilities(renderProps);

        expect(props.onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            date: new Date('2020-05-31T23:59:59.999Z'),
          }),
        );
      });
    });

    describe('when there are no existing net worth entries', () => {
      const propsNoEntries: PropsAdd = {
        ...props,
        data: [],
      };

      it('should set the date to today', () => {
        expect.assertions(2);
        const { getByText, getByDisplayValue } = renderWithMocks(
          <NetWorthAddForm {...propsNoEntries} />,
        );

        const title = getByText('On what date were the data collected?');
        const input = getByDisplayValue('2020-06-03');

        expect(title).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });
  });
});
