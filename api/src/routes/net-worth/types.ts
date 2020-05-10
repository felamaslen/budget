export type Category = {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  color: string;
};

export type Subcategory = {
  id: string;
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  opacity: number;
};

export type FXValue = {
  value: number;
  currency: string;
};

export type FXValueRow = {
  values_id: string;
  value: number | null;
  currency: string | null;
};

export type ComplexValueItem = number | FXValue;
export type ComplexValue = ComplexValueItem[];

export type Value = number | ComplexValue;

export type ValueObject = {
  subcategory: Subcategory['id'];
  skip?: boolean | null;
  value: Value;
};

export type ValueRow = {
  net_worth_id: string;
  skip: boolean | null;
  value: number | null;
};

export type Entry = {
  id: string;
  date: string;
  values: ValueObject[];
  creditLimit: {
    subcategory: Subcategory['id'];
    value: number;
  }[];
  currencies: {
    currency: string;
    rate: number;
  }[];
};
