import { PageListStandard } from '~api/types';

export enum Links {
  Budget = 'Budget',
  Deductions = 'Deductions',
}

export const sankeySpecialNames = [...Object.values(Links), ...Object.values(PageListStandard)];
