import { PageListCalc } from '~client/types/app';

export type MainBlockName = Exclude<PageListCalc, 'income'> | 'saved';
