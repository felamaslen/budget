import numericHash from 'string-hash';
import {
  Create,
  Currency,
  NetWorthCategory as Category,
  NetWorthCategoryType,
  NetWorthSubcategory as Subcategory,
  NetWorthEntry as Entry,
  NativeDate,
} from '~client/types';

export const CATEGORY_CASH: Category = {
  id: numericHash('real-cash-category-id'),
  type: NetWorthCategoryType.Asset,
  category: 'Cash (easy access)',
  color: '#00ff00',
  isOption: false,
};

export const CATEGORY_MORTGAGE_RAW: Create<Category> = {
  type: NetWorthCategoryType.Liability,
  category: 'Mortgage',
  color: '#fa0000',
  isOption: false,
};

export const CATEGORY_MORTGAGE = {
  ...CATEGORY_MORTGAGE_RAW,
  id: numericHash('real-mortgage-category-id'),
};

export const CATEGORY_CC: Category = {
  id: numericHash('real-credit-card-category-id'),
  type: NetWorthCategoryType.Liability,
  category: 'Credit cards',
  color: '#fc0000',
  isOption: false,
};

export const SUBCATEGORY_WALLET: Subcategory = {
  id: numericHash('real-wallet-subcategory-id'),
  categoryId: CATEGORY_CASH.id,
  subcategory: 'My wallet',
  hasCreditLimit: null,
  opacity: 0.2,
};

export const SUBCATEGORY_HOUSE: Subcategory = {
  id: numericHash('real-house-subcategory-id'),
  categoryId: CATEGORY_MORTGAGE.id,
  subcategory: 'My house',
  hasCreditLimit: false,
  opacity: 0.1,
};

export const SUBCATEGORY_CC: Subcategory = {
  id: numericHash('real-credit-card-subcategory-id'),
  categoryId: CATEGORY_CC.id,
  subcategory: 'My credit card',
  hasCreditLimit: true,
  opacity: 0.3,
};

export const CURRENCY_CZK: Currency = {
  currency: 'CZK',
  rate: 0.035,
};

export const ENTRY_BANK_HOUSE_RAW: NativeDate<Entry, 'date'> = {
  id: numericHash('real-entry-id'),
  date: new Date('2020-04-20'),
  values: [
    {
      subcategory: SUBCATEGORY_WALLET.id,
      value: 100653,
    },
    {
      subcategory: SUBCATEGORY_CC.id,
      value: -9965,
    },
    {
      subcategory: SUBCATEGORY_HOUSE.id,
      value: -2805562,
    },
  ],
  creditLimit: [
    {
      subcategory: SUBCATEGORY_CC.id,
      value: 150000,
    },
  ],
  currencies: [CURRENCY_CZK],
};

export const ENTRY_BANK_HOUSE: NativeDate<Entry, 'date'> = {
  ...ENTRY_BANK_HOUSE_RAW,
  date: new Date('2020-04-20'),
  values: ENTRY_BANK_HOUSE_RAW.values.slice(0, 3),
  currencies: [CURRENCY_CZK],
};
