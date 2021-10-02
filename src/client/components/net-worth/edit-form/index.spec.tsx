import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import type { DocumentNode } from 'graphql';
import React from 'react';
import numericHash from 'string-hash';
import { Client } from 'urql';
import { fromValue } from 'wonka';

import { NetWorthEditForm, NetWorthAddForm, PropsEdit, PropsAdd } from '.';
import * as QueryExchangeRates from '~client/gql/queries/exchange-rates';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import type { Id, NetWorthEntryNative as NetWorthEntry } from '~client/types';
import { NetWorthCategoryType } from '~client/types/enum';
import {
  NetWorthCategory,
  NetWorthSubcategory,
  NetWorthValueInput,
  Query,
  QueryExchangeRatesArgs,
} from '~client/types/gql';
import type { Create } from '~shared/types';

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
  const oldDateNextMonth = '2020-05-31T23:59:59.999Z';
  const newDate = '2020-04-24';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  const propsBase = {
    categories,
    subcategories,
    setActiveId: jest.fn(),
    onDelete: jest.fn(),
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
          paid: 10403,
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
    act(() => {
      fireEvent.click(getByText('Date'));
    });
    const inputDate = getByLabelText('entry-date');
    const buttonDone = getByText('Done');

    expect(inputDate).toBeInTheDocument();
    expect(buttonDone).toBeInTheDocument();

    if (setNewDate) {
      act(() => {
        fireEvent.change(inputDate, { target: { value: newDate } });
      });
      act(() => {
        fireEvent.blur(inputDate);
      });
    }
    act(() => {
      fireEvent.click(buttonDone);
    });
  };

  const updateCurrencyManually = ({ getByDisplayValue, getByText }: RenderResult): void => {
    act(() => {
      fireEvent.click(getByText('Currencies'));
    });
    const inputEUR = getByDisplayValue('0.84');
    const buttonDone = getByText('Done');

    expect(inputEUR).toBeInTheDocument();
    expect(buttonDone).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputEUR, { target: { value: '0.876' } });
    });
    act(() => {
      fireEvent.blur(inputEUR);
    });

    act(() => {
      fireEvent.click(buttonDone);
    });
  };

  const updateAssets = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    act(() => {
      fireEvent.click(getByText('Assets'));
    });
    const sectionCategoryMyAssets = getByText('My assets');
    const inputMyBankBefore = queryByDisplayValue('3856.1');
    const buttonDone = getByText('Done');

    expect(sectionCategoryMyAssets).toBeInTheDocument();
    expect(inputMyBankBefore).not.toBeInTheDocument();
    expect(buttonDone).toBeInTheDocument();

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

    act(() => {
      fireEvent.click(getByText('Done'));
    });
  };

  const updateOptions = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    act(() => {
      fireEvent.click(getByText('Assets'));
    });
    const sectionCategoryMyOptions = getByText('My options');
    const inputMyOptionUnitsBefore = queryByDisplayValue('1326');
    const inputMyOptionStrikeBefore = queryByDisplayValue('1350.2');
    const inputMyOptionMarketBefore = queryByDisplayValue('1899.19');

    const buttonDone = getByText('Done');

    expect(sectionCategoryMyOptions).toBeInTheDocument();
    expect(inputMyOptionUnitsBefore).not.toBeInTheDocument();
    expect(inputMyOptionStrikeBefore).not.toBeInTheDocument();
    expect(inputMyOptionMarketBefore).not.toBeInTheDocument();

    expect(buttonDone).toBeInTheDocument();

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
      fireEvent.click(buttonDone);
    });
  };

  const updateMortgage = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    act(() => {
      fireEvent.click(getByText('Liabilities'));
    });
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
    const inputMyMortgagePaid = getByDisplayValue('104.03');

    expect(inputMyMortgagePrincipal).toBeInTheDocument();
    expect(inputMyMortgagePaymentsRemaining).toBeInTheDocument();
    expect(inputMyMortgageRate).toBeInTheDocument();
    expect(inputMyMortgagePaid).toBeInTheDocument();

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
    act(() => {
      fireEvent.change(inputMyMortgagePaid, { target: { value: '144.9' } });
    });
    act(() => {
      fireEvent.blur(inputMyMortgagePaid);
    });

    act(() => {
      fireEvent.click(getByText('Done'));
    });
  };

  const updateCurrencyAutomatically = ({
    getByDisplayValue,
    getByText,
    getAllByText,
  }: RenderResult): void => {
    act(() => {
      fireEvent.click(getByText('Currencies'));
    });
    const inputEUR = getByDisplayValue('0.84') as HTMLInputElement;
    const refreshButtons = getAllByText('↻');
    const buttonDone = getByText('Done');

    expect(inputEUR).toBeInTheDocument();
    expect(refreshButtons).toHaveLength(2);

    expect(buttonDone).toBeInTheDocument();

    act(() => {
      fireEvent.click(refreshButtons[0]);
    });
    act(() => {
      jest.advanceTimersByTime(101);
    });

    expect(inputEUR.value).toBe(`${1 / 1.15}`);

    act(() => {
      fireEvent.click(buttonDone);
    });
  };

  const updateLiabilities = ({
    getByText,
    queryByDisplayValue,
    getByDisplayValue,
  }: RenderResult): void => {
    act(() => {
      fireEvent.click(getByText('Liabilities'));
    });
    const sectionCategoryMyLiabilities = getByText('My liabilities');
    const inputMyCCBefore = queryByDisplayValue('-210.54');
    const buttonDone = getByText('Done');

    expect(sectionCategoryMyLiabilities).toBeInTheDocument();
    expect(inputMyCCBefore).not.toBeInTheDocument();
    expect(buttonDone).toBeInTheDocument();

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
      fireEvent.click(buttonDone);
    });
  };

  describe('<NetWorthEditForm />', () => {
    const props: PropsEdit = {
      ...propsBase,
      item,
      onUpdate: jest.fn(),
    };

    describe('when initially opened', () => {
      it('should show an overview of the entry values', () => {
        expect.assertions(8);
        const { getByText } = renderWithMocks(<NetWorthEditForm {...props} />);

        expect(getByText('Date')).toBeInTheDocument();
        expect(getByText('20 Apr 2020')).toBeInTheDocument();

        expect(getByText('Currencies')).toBeInTheDocument();
        expect(getByText('EUR - 0.84000')).toBeInTheDocument();

        expect(getByText('Assets')).toBeInTheDocument();
        expect(getByText('£4k')).toBeInTheDocument();

        expect(getByText('Liabilities')).toBeInTheDocument();
        expect(getByText('(£169k)')).toBeInTheDocument();
      });

      describe('when clicking the date section', () => {
        it('should move to the date step', () => {
          expect.assertions(1);
          const { getByText } = renderWithMocks(<NetWorthEditForm {...props} />);
          act(() => {
            fireEvent.click(getByText('Date'));
          });
          const title = getByText('On what date were the data collected?');
          expect(title).toBeInTheDocument();
        });
      });

      describe('when clicking the currencies section', () => {
        it('should move to the currencies step', () => {
          expect.assertions(1);
          const { getByText } = renderWithMocks(<NetWorthEditForm {...props} />);
          act(() => {
            fireEvent.click(getByText('Currencies'));
          });
          const title = getByText(`Currencies - ${oldDate}`);
          expect(title).toBeInTheDocument();
        });
      });

      describe('when clicking the assets section', () => {
        it('should move to the currencies step', () => {
          expect.assertions(1);
          const { getByText } = renderWithMocks(<NetWorthEditForm {...props} />);
          act(() => {
            fireEvent.click(getByText('Assets'));
          });
          const title = getByText(`Assets - ${oldDate}`);
          expect(title).toBeInTheDocument();
        });
      });

      describe('when clicking the liabilities section', () => {
        it('should move to the currencies step', () => {
          expect.assertions(1);
          const { getByText } = renderWithMocks(<NetWorthEditForm {...props} />);
          act(() => {
            fireEvent.click(getByText('Liabilities'));
          });
          const title = getByText(`Liabilities - ${oldDate}`);
          expect(title).toBeInTheDocument();
        });
      });
    });

    describe('when on the date step', () => {
      it('should set the date', () => {
        expect.assertions(4);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        expect(props.onUpdate).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          expect.objectContaining({
            date: new Date(newDate),
          }),
        );
      });
    });

    describe('when on the currencies step', () => {
      it('should set the currencies manually', () => {
        expect.assertions(4);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateCurrencyManually(renderProps);
        expect(props.onUpdate).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          expect.objectContaining({
            currencies: [
              {
                currency: 'EUR',
                rate: 0.876,
              },
            ],
          }),
        );
      });

      it('should set the currencies automatically', () => {
        expect.assertions(6);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateCurrencyAutomatically(renderProps);
        expect(props.onUpdate).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          expect.objectContaining({
            currencies: [
              {
                currency: 'EUR',
                rate: 1 / 1.15,
              },
            ],
          }),
        );
      });
    });

    describe('when on the assets step', () => {
      it('should set the assets', () => {
        expect.assertions(6);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateAssets(renderProps);
        expect(props.onUpdate).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          expect.objectContaining({
            values: expect.arrayContaining<NetWorthValueInput>([
              {
                subcategory: numericHash('fake-subcategory-id-bank-account'),
                simple: 400012,
                skip: null,
                fx: null,
                option: null,
                loan: null,
              },
            ]),
          }),
        );
      });

      it('should set the options', () => {
        expect.assertions(10);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateOptions(renderProps);
        expect(props.onUpdate).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          expect.objectContaining({
            values: expect.arrayContaining<NetWorthValueInput>([
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
            ]),
          }),
        );
      });
    });

    describe('when on the liabilities step', () => {
      it('should set the liabilities', () => {
        expect.assertions(15);
        const renderProps = renderWithMocks(<NetWorthEditForm {...props} />);
        updateLiabilities(renderProps);
        updateMortgage(renderProps);
        expect(props.onUpdate).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Create<NetWorthEntry>]>(
          numericHash('some-fake-id'),
          expect.objectContaining({
            values: expect.arrayContaining<NetWorthValueInput>([
              {
                subcategory: numericHash('fake-subcategory-id-cc'),
                simple: -15901,
                skip: false,
                fx: null,
                option: null,
                loan: null,
              },
              {
                subcategory: numericHash('fake-subcategory-id-my-mortgage'),
                loan: {
                  principal: 15599823,
                  paymentsRemaining: 175,
                  rate: 1.69,
                  paid: 14490,
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
          }),
        );
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

    describe('when entering values', () => {
      const setup = (): RenderResult => {
        const renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateMortgage(renderProps);
        updateLiabilities(renderProps);
        return renderProps;
      };

      it('should call onCreate with the combined values from the previous entry in the next month', async () => {
        expect.assertions(33);
        const renderProps = setup();

        expect(props.onCreate).not.toHaveBeenCalled();

        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
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
                  paid: 14490,
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
        expect.assertions(32);
        const renderProps = setup();
        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });
        expect(props.setActiveId).toHaveBeenCalledWith(null);
      });
    });

    describe('when a date is not entered', () => {
      it('should use the end date of the next month', () => {
        expect.assertions(24);
        const renderProps = renderWithMocks(<NetWorthAddForm {...props} />);
        updateDate(renderProps, false);
        updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateLiabilities(renderProps);

        act(() => {
          fireEvent.click(renderProps.getByText('Save'));
        });

        expect(props.onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            date: new Date(oldDateNextMonth),
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

        act(() => {
          fireEvent.click(getByText('Date'));
        });

        const title = getByText('On what date were the data collected?');
        const input = getByDisplayValue('2020-06-03');

        expect(title).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });
  });
});
