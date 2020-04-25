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

type ComplexValue = (
  | number
  | {
      value: number;
      currency: string;
    }
)[];

type Value = number | ComplexValue;

export type Entry = {
  id: string;
  date: Date;
  values: {
    subcategory: Subcategory['id'];
    skip: boolean | null;
    value: Value;
  }[];
  creditLimit: {
    subcategory: Subcategory['id'];
    value: number;
  }[];
  currencies: {
    currency: string;
    rate: number;
  }[];
};
