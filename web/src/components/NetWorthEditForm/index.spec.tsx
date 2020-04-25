import sinon from 'sinon';
import React from 'react';
import { render, fireEvent, act, RenderResult, waitFor } from '@testing-library/react';
import nock from 'nock';
import { DateTime } from 'luxon';

import { Category, Subcategory, Entry } from '~client/types/net-worth';
import { NetWorthEditForm, NetWorthAddForm, PropsEdit, PropsAdd } from '.';

const categories: Category[] = [
  {
    id: 'fake-category-id-my-assets',
    category: 'My assets',
    type: 'asset',
    color: 'green',
  },
  {
    id: 'fake-category-id-my-liabilities',
    category: 'My liabilities',
    type: 'liability',
    color: 'red',
  },
];

const subcategories: Subcategory[] = [
  {
    id: 'fake-subcategory-id-bank-account',
    categoryId: 'fake-category-id-my-assets',
    subcategory: 'My bank account',
    hasCreditLimit: null,
    opacity: 1,
  },
  {
    id: 'fake-subcategory-id-cc',
    categoryId: 'fake-category-id-my-liabilities',
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
    id: 'some-fake-id',
    date: DateTime.fromJSDate(new Date(oldDate)),
    values: [
      {
        id: 'fake-value-id-bank-account',
        subcategory: 'fake-subcategory-id-bank-account',
        value: 385610,
      },
      {
        id: 'fake-value-id-cc',
        subcategory: 'fake-subcategory-id-cc',
        value: -21054,
        skip: false,
      },
    ],
    creditLimit: [
      {
        subcategory: 'fake-subcategory-id-cc',
        value: 650000,
      },
    ],
    currencies: [
      {
        id: 'some-fake-currency-id',
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

    const inputMyBank = getByDisplayValue('3856.1');
    expect(inputMyBank).toBeInTheDocument();

    act(() => {
      fireEvent.change(inputMyBank, { target: { value: '4000.12' } });
    });
    act(() => {
      fireEvent.blur(inputMyBank);
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

    const inputCreditLimit = getByDisplayValue('6500');
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
        const { getByText } = render(<NetWorthEditForm {...props} />);
        const title = getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });

      it('should move to the currencies step when hitting next', () => {
        const renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);

        expect(props.onUpdate).not.toHaveBeenCalled();

        const title = renderProps.getByText(`Currencies - ${newDate}`);
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the currencies step', () => {
      it('should move to the assets step when hitting next', () => {
        const renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);

        const title = renderProps.getByText('Assets');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the assets step', () => {
      it('should move to the liabilities step when hitting next', () => {
        const renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);
        updateAssets(renderProps);

        const title = renderProps.getByText('Liabilities');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the liabilities step', () => {
      let renderProps: RenderResult;

      beforeEach(async () => {
        renderProps = render(<NetWorthEditForm {...props} />);
        updateDate(renderProps);
        await updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateLiabilities(renderProps);
      });

      it('should call onUpdate when hitting finish', () => {
        expect(props.onUpdate).toHaveBeenCalledWith('some-fake-id', {
          id: 'some-fake-id',
          date: DateTime.fromJSDate(new Date(newDate)),
          values: [
            {
              id: 'fake-value-id-bank-account',
              subcategory: 'fake-subcategory-id-bank-account',
              value: 400012,
              skip: null,
            },
            {
              id: 'fake-value-id-cc',
              subcategory: 'fake-subcategory-id-cc',
              value: -15901,
              skip: false,
            },
          ],
          creditLimit: [
            {
              subcategory: 'fake-subcategory-id-cc',
              value: 600000,
            },
          ],
          currencies: [
            {
              id: 'some-fake-currency-id',
              currency: 'USD',
              rate: 1 / 1.24859,
            },
          ],
        });
      });

      it('should reset the active ID', () => {
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
        const { getByText } = render(<NetWorthAddForm {...props} />);
        const title = getByText('On what date were the data collected?');
        expect(title).toBeInTheDocument();
      });

      it('should move to the currencies step when hitting next', () => {
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);

        expect(props.onCreate).not.toHaveBeenCalled();

        const title = renderProps.getByText(`Currencies - ${newDate}`);
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the currencies step', () => {
      it('should move to the assets step when hitting next', () => {
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);

        const title = renderProps.getByText('Assets');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the assets step', () => {
      it('should move to the liabilities step when hitting next', () => {
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        updateCurrencyManually(renderProps);
        updateAssets(renderProps);

        const title = renderProps.getByText('Liabilities');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when on the liabilities step', () => {
      let renderProps: RenderResult;

      beforeEach(async () => {
        renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps);
        await updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateLiabilities(renderProps);
      });

      it('should call onCreate when hitting finish', async () => {
        expect(props.onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            date: DateTime.fromJSDate(new Date(newDate)),
            values: expect.arrayContaining([
              expect.objectContaining({
                subcategory: 'fake-subcategory-id-bank-account',
                value: 400012,
                skip: null,
              }),
              expect.objectContaining({
                subcategory: 'fake-subcategory-id-cc',
                value: -15901,
                skip: false,
              }),
            ]),
            creditLimit: [
              expect.objectContaining({
                subcategory: 'fake-subcategory-id-cc',
                value: 600000,
              }),
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

      it('should reset the active ID', () => {
        expect(props.setActiveId).toHaveBeenCalledWith(null);
      });
    });

    describe('if a date is not entered', () => {
      it('should use the end date of the next month', async () => {
        const renderProps = render(<NetWorthAddForm {...props} />);
        updateDate(renderProps, false);
        await updateCurrencyAutomatically(renderProps);
        updateAssets(renderProps);
        updateLiabilities(renderProps);

        expect(props.onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            date: DateTime.fromJSDate(new Date('2020-05-31T23:59:59.999Z')),
          }),
        );
      });
    });
  });
});
