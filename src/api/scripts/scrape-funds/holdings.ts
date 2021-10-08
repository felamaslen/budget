import groupBy from 'lodash/groupBy';
import prompts from 'prompts';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getHoldingsFromDataHL } from './hl';
import { selectStockCodes, insertStockCodes, cleanStocksList, insertStocksList } from './queries';
import { Fund, Holding, Stock, StockCode, StockCodes, WeightedHolding } from './types';
import logger from '~api/modules/logger';

type FundWithHoldings = Fund & {
  holdings: Holding[];
};

// This is necessary because funds are separated by UID for the purposes of holdings
type DataByUrl = {
  [url: string]: string;
};

async function getStockCodes(db: DatabaseTransactionConnectionType): Promise<StockCodes> {
  // get a saved map of saved stock codes so that the user doesn't need to enter
  // them every time
  logger.debug('Getting list of stock codes from database');

  const codes = await selectStockCodes(db);
  return codes.reduce<StockCodes>((items, { name, code }) => ({ ...items, [name]: code }), {});
}

async function saveStockCodes(
  db: DatabaseTransactionConnectionType,
  stockCodes: StockCodes,
): Promise<void> {
  logger.debug('Saving updated stock codes to database');

  if (!Object.keys(stockCodes).length) {
    return;
  }

  await insertStockCodes(db, stockCodes);
}

async function saveStocksList(
  db: DatabaseTransactionConnectionType,
  stocksList: Stock[],
): Promise<void> {
  logger.debug('Inserting stocks list into database');

  await cleanStocksList(db);
  if (!stocksList.length) {
    return;
  }
  await insertStocksList(db, stocksList);
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

async function updateHoldings(
  db: DatabaseTransactionConnectionType,
  fundsWithHoldings: FundWithHoldings[],
): Promise<void> {
  const stockCodes = await getStockCodes(db);

  const groupedByUid = groupBy(fundsWithHoldings, 'uid');
  const totalCost: { [uid: number]: number } = Object.keys(groupedByUid).reduce(
    (last, uid) => ({
      ...last,
      [uid]: groupedByUid[uid].reduce((sum, { cost }) => sum + Math.max(0, cost), 0),
    }),
    {},
  );

  const fundsHoldings = fundsWithHoldings.reduce<WeightedHolding[]>(
    (rows, { holdings, uid, cost }) => [
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

  logger.debug('Getting any missing stock codes from user input');
  const result = await fundsHoldings.reduce<
    Promise<{
      stocks: Stock[];
      codes: StockCodes;
    }>
  >(
    (last, { name, ...holding }) =>
      last.then(async (next) => {
        let stock: Stock | null = null;
        let stockCode: StockCode | undefined = undefined;

        try {
          const code = await getCodeForStock(name, stockCodes, next.codes);
          if (!(name in stockCodes) && !(name in next.codes)) {
            stockCode = code;
          }
          if (code) {
            stock = { ...holding, name, code };
          } else {
            logger.warn(`Skipped null code for stock: ${name}`);
          }
        } catch (err) {
          if ((err as Error).message === 'Cancelled') {
            // this happens iff the user cancels a prompt for a stock code
            // in this case, we exit the entire process (for good UX)
            logger.info('Fund holdings update process cancelled by user');
          }
        }

        return {
          stocks: stock ? [...next.stocks, stock] : next.stocks,
          codes:
            typeof stockCode === 'undefined' ? next.codes : { ...next.codes, [name]: stockCode },
        };
      }),
    Promise.resolve({
      stocks: [],
      codes: {},
    }),
  );

  await saveStockCodes(db, result.codes);
  await saveStocksList(db, result.stocks);
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
  return funds.reduce<FundWithHoldings[]>((results, fund) => {
    if (!(fund.url && data[fund.url])) {
      logger.debug(`Skipping fund holdings without URL/data: ${fund.name}`);
      return results;
    }
    try {
      const holdings = getFundHoldings(fund, data[fund.url]);

      if (!holdings) {
        return results;
      }

      logger.debug(`Processed holdings for ${fund.name}`);

      const numErrors = holdings.filter((item) => !item).length;

      if (numErrors > 0) {
        logger.warn(`Couldn't process ${numErrors} item(s)`);
      }

      return [
        ...results,
        {
          ...fund,
          holdings: holdings.filter((item) => item),
        },
      ];
    } catch (err) {
      logger.warn(`Couldn't get holdings for fund with name: ${fund.name}`);
      logger.debug((err as Error).stack);

      return results;
    }
  }, []);
}

export async function scrapeFundHoldings(
  db: DatabaseTransactionConnectionType,
  funds: Fund[],
  uniqueFunds: Fund[],
  data: (string | null)[],
): Promise<void> {
  logger.info('Processing fund holdings...');

  const dataByUrl: DataByUrl = uniqueFunds.reduce<DataByUrl>(
    (last, { url }, index) =>
      url && data[index]
        ? {
            ...last,
            [url]: data[index] as string,
          }
        : last,
    {},
  );

  const fundsWithHoldings = getFundsWithHoldings(funds, dataByUrl);

  await updateHoldings(db, fundsWithHoldings);
}
