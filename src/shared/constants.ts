export enum NetWorthAggregate {
  cashEasyAccess = 'Cash (easy access)',
  cashOther = 'Cash (other)',
  stocks = 'Stocks', // this is actually stock+cash investments
  pension = 'Pension',
  realEstate = 'House',
  mortgage = 'Mortgage',
}

// List of cost categories which should count as investments, rather than pure expense
export const investmentPurchaseCategories = ['House purchase'];
