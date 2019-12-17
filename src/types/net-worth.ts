export interface Category {
  id: string;
  type: string;
  category: string | null;
  color?: string | null;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  subcategory: string | null;
  hasCreditLimit: boolean | null;
  opacity: number | null;
}

export type FXValue = (
  | number
  | {
      value: number;
      currency?: string | null;
    }
)[];

export type EntryValue = number | FXValue;

export type Value = {
  id: string;
  subcategory: string;
  skip: boolean;
  value: EntryValue;
};

export type CreditLimit = {
  subcategory: string;
  limit: number;
};

export type Currency = {
  id: string;
  currency: string;
  rate: number;
};

export interface Entry {
  id: string;
  date: string | Date;
  values: Value[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
}
