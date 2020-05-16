export type Category = {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  color: string;
  isOption?: boolean;
};

export type CategoryRow = Pick<Category, 'id' | 'type' | 'category' | 'color'> & {
  is_option: Category['isOption'];
};

export type Subcategory = {
  id: string;
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  opacity: number;
};

export type SubcategoryRow = Pick<Subcategory, 'id' | 'subcategory' | 'opacity'> & {
  category_id: Subcategory['categoryId'];
  has_credit_limit: Subcategory['hasCreditLimit'];
};

export type FXValue = {
  value: number;
  currency: string;
};

export type OptionValue = {
  units: number;
  strikePrice: number;
  marketPrice: number;
};

export type ComplexValueItem = number | FXValue | OptionValue;
export type ComplexValue = ComplexValueItem[];

export type Value = number | ComplexValue;

export type ValueObject = {
  subcategory: Subcategory['id'];
  skip?: boolean | null;
  value: Value;
};

export type CreditLimit = {
  subcategory: Subcategory['id'];
  value: number;
};

export type Currency = {
  currency: string;
  rate: number;
};

export type Entry = {
  id: string;
  date: string;
  values: ValueObject[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
};
