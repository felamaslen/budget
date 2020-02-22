import prompts from 'prompts';
import groupBy from 'lodash/groupBy';

import db from '~api/modules/db';
import logger from '~api/modules/logger';
import { getHoldingsFromDataHL } from './hl';
import { Fund, Holding, Stock, StockCode, StockCodes } from './types';

type FundWithHoldings = Fund & {
  holdings: Holding[];
};

// This is necessary because funds are separated by UID for the purposes of holdings
type DataByUrl = {
  [url: string]: string;
};

async function getStockCodes(): Promise<StockCodes> {
  // get a saved map of saved stock codes so that the user doesn't need to enter
  // them every time
  logger.debug('Getting list of stock codes from database');

  const codes = await db.select('name', 'code').from('stock_codes');

  return codes.reduce((items, { name, code }) => ({ ...items, [name]: code }), {});
}

async function saveStockCodes(stockCodes: StockCodes): Promise<void> {
  logger.debug('Saving updated stock codes to database');

  const names = Object.keys(stockCodes);
  if (!names.length) {
    return;
  }

  const rows = names.map(name => ({ name, code: stockCodes[name] }));

  await db.batchInsert('stock_codes', rows, 30);
}

async function saveStocksList(stocksList: Stock[]): Promise<void> {
  logger.debug('Inserting stocks list into database');

  await db('stocks').truncate();

  if (!stocksList.length) {
    return;
  }

  await db.batchInsert('stocks', stocksList, 30);
}

async function getCodeForStock(
  name: string,
  stockCodes: StockCodes,
  newStockCodes: StockCodes,
): Promise<StockCode> {
  if (name in stockCodes) {
    return stockCodes[name];
  }
  if (name in newStockCodes) {
    return newStockCodes[name];
  }

  const { code } = await prompts({
    type: 'text',
    name: 'code',
    message: `Enter code for ${name}`,
  });

  if (typeof code === 'undefined') {
    throw new Error('Cancelled');
  }

  return code || null;
}

type WeightedHolding = {
  uid: string;
  name: string;
  weight: number;
  subweight: number;
};

async function updateHoldings(fundsWithHoldings: FundWithHoldings[]): Promise<void> {
  const stockCodes = await getStockCodes();

  const groupedByUid = groupBy(fundsWithHoldings, 'uid');
  const totalCost: { [uid: string]: number } = Object.keys(groupedByUid).reduce(
    (last, uid) => ({
      ...last,
      [uid]: groupedByUid[uid].reduce((sum, { cost }) => sum + Math.max(0, cost), 0),
    }),
    {},
  );

  const fundsHoldings: WeightedHolding[] = fundsWithHoldings.reduce(
    (rows: WeightedHolding[], { holdings, uid, cost }) => [
      ...rows,
      ...holdings
        .sort(({ name: nameA }, { name: nameB }) => (nameA < nameB ? -1 : 1))
        .map(({ name, value: subweight }) => ({
          uid,
          name,
          weight: cost / totalCost[uid],
          subweight,
        })),
    ],
    [],
  );

  const newStocks: Stock[] = [];
  const newStockCodes: StockCodes = {};

  logger.debug('Getting any missing stock codes from user input');
  await fundsHoldings.reduce(
    (last, { name, ...holding }) =>
      last.then(async () => {
        try {
          const code = await getCodeForStock(name, stockCodes, newStockCodes);
          if (!(name in stockCodes) && !(name in newStockCodes)) {
            newStockCodes[name] = code;
          }
          if (code) {
            newStocks.push({ ...holding, name, code });
          } else {
            logger.warn(`Skipped null code for stock: ${name}`);
          }
        } catch (err) {
          if (err.message === 'Cancelled') {
            // this happens iff the user cancels a prompt for a stock code
            // in this case, we exit the entire process (for good UX)
            logger.info('Fund holdings update process cancelled by user');
          }
        }
      }),
    Promise.resolve(),
  );

  await saveStockCodes(newStockCodes);

  await saveStocksList(newStocks);
}

function getFundHoldings(fund: Fund, data: string): Holding[] {
  // get the top stock holdings for a fund
  if (!data) {
    throw new Error('Holdings data empty');
  }

  if (fund.broker === 'hl') {
    return getHoldingsFromDataHL(fund, data);
  }

  throw new Error('Unknown broker');
}

function getFundsWithHoldings(funds: Fund[], data: DataByUrl): FundWithHoldings[] {
  // get the top stock holdings for a list of funds and add it to the array
  return funds.reduce((results: FundWithHoldings[], fund) => {
    try {
      const holdings = getFundHoldings(fund, data[fund.url]);

      if (!holdings) {
        return results;
      }

      logger.debug(`Processed holdings for ${fund.name}`);

      const numErrors = holdings.filter(item => !item).length;

      if (numErrors > 0) {
        logger.warn(`Couldn't process ${numErrors} item(s)`);
      }

      return [
        ...results,
        {
          ...fund,
          holdings: holdings.filter(item => item),
        },
      ];
    } catch (err) {
      logger.warn(`Couldn't get holdings for fund with name: ${fund.name}`);
      logger.debug(err.stack);

      return results;
    }
  }, []);
}

export async function scrapeFundHoldings(
  funds: Fund[],
  uniqueFunds: Fund[],
  data: string[],
): Promise<void> {
  logger.info('Processing fund holdings...');

  const dataByUrl: DataByUrl = uniqueFunds.reduce(
    (last: DataByUrl, { url }, index) => ({
      ...last,
      [url]: data[index],
    }),
    {},
  );

  const fundsWithHoldings = getFundsWithHoldings(funds, dataByUrl);

  await updateHoldings(fundsWithHoldings);
}
