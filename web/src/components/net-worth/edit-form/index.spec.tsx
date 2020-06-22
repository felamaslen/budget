import { render, fireEvent, act, RenderResult, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import sinon from 'sinon';
import numericHash from 'string-hash';

import { NetWorthEditForm, NetWorthAddForm, PropsEdit, PropsAdd } from '.';
import { Category, Subcategory, Entry, ValueObject, Id, CreateEntry } from '~client/types';

const categories: Category[] = [
  {
    id: numericHash('fake-category-id-my-assets'),
    category: 'My assets',
    type: 'asset',
    color: 'green',
    isOption: false,
  },
  {
    id: numericHash('fake-category-id-my-options'),
    category: 'My options',
    type: 'asset',
    color: 'orange',
    isOption: true,
  },
  {
    id: numericHash('fake-category-id-my-liabilities'),
    category: 'My liabilities',
    type: 'liability',
    color: 'red',
    isOption: false,
  },
];

const subcategories: Subcategory[] = [
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

  const item: Entry = {
    id: numericHash('some-fake-id'),
    date: new Date(oldDate),
    values: [
      {
        id: numericHash('fake-value-id-bank-account'),
        subcategory: numericHash('fake-subcategory-id-bank-account'),
        value: 385610,
      },
      {
        id: numericHash('fake-value-id-some-share'),
        subcategory: numericHash('fake-subcategory-id-some-share'),
        value: [
          {
            units: 1326,
            strikePrice: 1350.2,
            marketPrice: 1899.19,
          },
        ],
      },
      {
        id: numericHash('fake-value-id-cc'),
        subcategory: numericHash('fake-subcategory-id-cc'),
        value: -21054,
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
        id: numericHash('some-fake-currency-id'),
        currency: 'USD',
        rate: 0.78,
      },
    ],
  };

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
    const inputUSD = getByDisplayValue('0.78');
    const buttonNext = getByText('Next');

    expect(inputUSD).toBeInTheDocument();
    expect(buttonNext).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputUSD, { target: { value: '0.776' } });
    });
    act(() => {
      fireEvent.blur(inputUSD);
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

  const updateCurrencyAutomatically = async ({
    getByDisplayValue,
    getByText,
    getAllByText,
  }: RenderResult): Promise<void> => {
    const inputUSD = getByDisplayValue('0.78') as HTMLInputElement;
    const refreshButtons = getAllByText('↻');
    const buttonNext = getByText('Next');

    expect(inputUSD).toBeInTheDocument();
    expect(refreshButtons).toHaveLength(2);

    expect(buttonNext).toBeInTheDocument();

    nock('https://api.exchangeratesapi.io')
      .defaultReplyHeaders({
        'Access-Control-Allow-Origin': '*',
      })
      .get(`/latest?_timestamp=${now.getTime() + 100}&base=GBP&symbols=USD`)
      .reply(200, {
        rates: {
          USD: 1.24859,
        },
        base: 'GBP',
      });

    act(() => {
      fireEvent.click(refreshButtons[0]);
    });
    act(() => {
      clock.tick(101);
    });

    await waitFor(
      () => {
        expect(inputUSD.value).toBe(`${1 / 1.24859}`);
      },
      {
        container: inputUSD,
        timeout: 1000,
        mutationObserverOptions: {
          attributes: true,
        },
      },
    );

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
        const { getByText } = render(<NetWorthEditForm {...props} />);
        const title = getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });

      it('should move to the currencies step when hitting next', () => {
        expect.assertions(4);
        const renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);

        expect(props.onUpdate).not.toHaveBeenCalled();

        const title = renderProps.getByText(`Currencies - ${newDate}`);
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the currencies step', () => {
      it('should move to the assets step when hitting next', () => {
        expect.assertions(5);
        const renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);

        const title = renderProps.getByText('Assets');
        expect(title).toBeInTheDocument();
      });

      it('should move back to the date step when hitting previous', () => {
        expect.assertions(4);
        const renderProps = render(<NetWorthEditForm {...props} />);
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
        const renderProps = render(<NetWorthEditForm {...props} />);
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

      const setup = async (): Promise<void> => {
        renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        await updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateLiabilities(renderProps);
      };

      it('should call onUpdate when hitting finish', async () => {
        expect.assertions(25);
        await setup();
        expect(props.onUpdate).toHaveBeenCalledWith<[Id, Entry]>(numericHash('some-fake-id'), {
          id: numericHash('some-fake-id'),
          date: new Date(newDate),
          values: expect.arrayContaining<ValueObject>([
            {
              id: numericHash('fake-value-id-bank-account'),
              subcategory: numericHash('fake-subcategory-id-bank-account'),
              value: 400012,
              skip: null,
            },
            {
              id: numericHash('fake-value-id-cc'),
              subcategory: numericHash('fake-subcategory-id-cc'),
              value: -15901,
              skip: false,
            },
            {
              id: numericHash('fake-value-id-some-share'),
              subcategory: numericHash('fake-subcategory-id-some-share'),
              value: [
                {
                  units: 1006,
                  strikePrice: 1440.2,
                  marketPrice: 2093.7,
                },
              ],
              skip: null,
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
              id: numericHash('some-fake-currency-id'),
              currency: 'USD',
              rate: 1 / 1.24859,
            },
          ],
        });
      });

      it('should reset the active ID', async () => {
        expect.assertions(25);
        await setup();
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
        const { getByText } = render(<NetWorthAddForm {...props} />);
        const title = getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });

      it('should move to the currencies step when hitting next', () => {
        expect.assertions(4);
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);

        expect(props.onCreate).not.toHaveBeenCalled();

        const title = renderProps.getByText(`Currencies - ${newDate}`);
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the currencies step', () => {
      it('should move to the assets step when hitting next', () => {
        expect.assertions(5);
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);

        const title = renderProps.getByText('Assets');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the assets step', () => {
      it('should move to the liabilities step when hitting next', () => {
        expect.assertions(17);
        const renderProps = render(<NetWorthAddForm {...props} />);
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

      const setup = async (): Promise<void> => {
        renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        await updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateOptions(renderProps);
        updateLiabilities(renderProps);
      };

      it('should call onCreate when hitting finish', async () => {
        expect.assertions(25);
        await setup();
        expect(props.onCreate).toHaveBeenCalledWith<[CreateEntry]>(
          expect.objectContaining<Partial<CreateEntry>>({
            date: new Date(newDate),
            values: expect.arrayContaining([
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-bank-account'),
                value: 400012,
                skip: null,
              }),
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-some-share'),
                value: [
                  {
                    units: 1006,
                    strikePrice: 1440.2,
                    marketPrice: 2093.7,
                  },
                ],
                skip: null,
              }),
              expect.objectContaining({
                subcategory: numericHash('fake-subcategory-id-cc'),
                value: -15901,
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
                currency: 'USD',
                rate: 1 / 1.24859,
              }),
            ],
          }),
        );
      });

      it('should reset the active ID', async () => {
        expect.assertions(25);
        await setup();
        expect(props.setActiveId).toHaveBeenCalledWith(null);
      });
    });

    describe('if a date is not entered', () => {
      it('should use the end date of the next month', async () => {
        expect.assertions(25);
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps, false);
        await updateCurrencyAutomatically(renderProps);
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
        const { getByText, getByDisplayValue } = render(<NetWorthAddForm {...propsNoEntries} />);

        const title = getByText('On what date were the data collected?');
        const input = getByDisplayValue('2020-06-03');

        expect(title).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });
  });
});
