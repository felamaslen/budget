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
