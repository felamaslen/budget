export type Cost = {
    spending: number[];
    net: number[];
    netWorthCombined: number[];
    funds: number[];
    fundsOld: number[];
};

export type Target = {
    date: number;
    from: number;
    value: number;
    months: number;
    last: number;
    tag: string;
};
