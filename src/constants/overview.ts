import { TableColumns } from '~/types/overview';

export const OVERVIEW_COLUMNS: [
  keyof TableColumns,
  string,
  {
    to: string;
    replace?: boolean;
  }?,
][] = [
  ['funds', 'Stocks'],
  ['bills', 'Bills'],
  ['food', 'Food'],
  ['general', 'General'],
  ['holiday', 'Holiday'],
  ['social', 'Social'],
  ['income', 'Income'],
  ['spending', 'Out'],
  ['net', 'Net'],
  ['netWorthPredicted', 'Predicted'],
  ['netWorth', 'Net Worth', { to: '/net-worth', replace: true }],
];

// investment rate of return (assumed, per annum)
export const FUTURE_INVESTMENT_RATE = 0.1;
