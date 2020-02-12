import { Data } from '~client/types/graph';
import { Color } from '~client/constants/colors';

type Transaction = {
    date: Date;
    units: number;
    cost: number;
};

export type Row = {
    id: string;
    item: string;
    transactions: Transaction[];
};

export type Prices = {
    [id: string]: {
        values: number[];
        startIndex: number;
    };
};

export type FundItem = {
    id: string;
    item: string;
    color: Color;
};

export type FundLine = Pick<FundItem, 'id' | 'color'> & {
    data: Data;
};

export type Stock = {
    code: string;
    name: string;
    weight: number;
    gain: number;
    price?: number;
    up: boolean;
    down: boolean;
};
