/**
 * Process overview data
 */

import { AVERAGE_MEDIAN, MONTHS_SHORT, OVERVIEW_COLUMNS } from '../../misc/const';
import { FUTURE_INVESTMENT_RATE } from '../../misc/config';
import { yearMonthDifference } from '../../misc/date';
import { listAverage, randnBm } from '../../misc/data';
import { List as list, Map as map, fromJS } from 'immutable';

/**
 * Calculate futures from past averages / predictions
 * @param {List} data: processed data
 * @param {integer} futureKey: key in data where future begins
 * @returns {List} first six columns of data for overview table
 */
const calculateFutures = (data, futureKey) => {
  const categories = list.of('funds', 'bills', 'food', 'general', 'holiday', 'social');
  const futureCategories = list.of('food', 'general', 'holiday', 'social');

  return categories.map(category => {
    const categoryCost = data.getIn(['cost', category]);

    if (futureCategories.indexOf(category) > -1) {
      // find the average value and make predictions based on that
      const average = Math.round(listAverage(categoryCost, data.get('futureMonths'), AVERAGE_MEDIAN));
      const newCost = categoryCost.slice(
        0, categoryCost.size - data.get('futureMonths')
      ).concat(
        list(Array.apply(null, new Array(data.get('futureMonths'))).map(() => average))
      );
      return newCost;
    }

    if (category === 'funds') {
      // randomly generate fund income projections
      const oldOffset = categoryCost.size - data.getIn(['cost', 'balance']).size;
      let Xt = categoryCost.get(oldOffset + futureKey - 1);
      return categoryCost.slice(oldOffset, oldOffset + futureKey).concat(list(
        Array.apply(null, new Array(categoryCost.size - oldOffset - futureKey)).map(() => {
          Xt *= (1 + FUTURE_INVESTMENT_RATE / 12 + randnBm() / 100);
          return Math.round(Xt);
        })
      ));
    }

    // return the plain jain data
    return categoryCost;
  });
};

/**
 * Calculate the remaining table data, e.g. net income
 * Called after calculateFutures() which predicts future data
 * @param {List} data: processed data
 * @param {List} futureData: predictions of future data
 * @param {integer} startYear: start year of displayed data
 * @param {integer} startMonth: start month of displayed data
 * @param {integer} futureKey: key in data where future begins
 * @returns {List} all twelve columns of data for overview table
 */
const calculateTableData = (data, futureData, startYear, startMonth, futureKey) => {
  // add month column
  const months = list(Array.apply(null, new Array(futureData.get(0).size)).map((_, key) => {
    const month = MONTHS_SHORT[(startMonth - 1 + key) % 12];
    const year = startYear + Math.floor((startMonth - 1 + key) / 12);
    return `${month}-${year}`;
  }));

  // add income column
  const income = data.getIn(['cost', 'income']);

  // add spending column
  const spending = months.map((month, key) => {
    return futureData.getIn([1, key]) + // bills
      futureData.getIn([2, key]) + // food
      futureData.getIn([3, key]) + // general
      futureData.getIn([4, key]) + // holiday
      futureData.getIn([5, key]); // social
  });

  // add net cash flow column
  const net = months.map((month, key) => {
    // add predicted (random) fund income to the net cash flow
    const fundIncome = key === 0 || key < futureKey ? 0
      : futureData.getIn([0, key]) - futureData.getIn([0, key - 1]);

    return income.get(key) - spending.get(key) + fundIncome;
  });

  // add predicted and actual balance columns
  const balance = data.getIn(['cost', 'balance']);
  const predicted = months.map((month, key) => {
    if (key === 0) {
      return balance.get(key);
    }
    return balance.get(key - 1) + net.get(key);
  });

  return list([])
  .push(months)
  .concat(futureData)
  .push(income)
  .push(spending)
  .push(net)
  .push(predicted)
  .push(balance);
};

/**
 * Process data for insertion into the store
 * @param {object} raw: api JSON data response
 * @returns {Map} immutable data
 */
export const rProcessDataOverview = raw => {
  const numRows = yearMonthDifference(raw.startYearMonth, raw.endYearMonth) + 1;

  return map({
    numRows,
    futureMonths: raw.futureMonths,
    startYearMonth: raw.startYearMonth,
    currentYearMonth: [raw.currentYear, raw.currentMonth],
    cost: fromJS(raw.cost)
  });
};

/**
 * Get rows for display in the view
 * @param {List} data: processed data
 * @returns {List} rows for the view
 */
export const rGetOverviewRows = data => {
  const startYear = data.get('startYearMonth')[0];
  const startMonth = data.get('startYearMonth')[1];
  const currentYear = data.get('currentYearMonth')[0];
  const currentMonth = data.get('currentYearMonth')[1];

  const futureKey = yearMonthDifference(data.get('startYearMonth'), data.get('currentYearMonth')) + 1;

  const futureData = calculateFutures(data, futureKey);
  const tableData = calculateTableData(data, futureData, startYear, startMonth, futureKey);

  // translate the data into table cells for display in the view
  const rows = list(tableData.get(0).map((monthText, key) => {
    const year = startYear + Math.floor((startMonth - 1 + key) / 12);
    const month = (startMonth + key + 11) % 12 + 1; // 1-indexed

    const past = year < currentYear || (year === currentYear && month < currentMonth);
    const active = year === currentYear && month === currentMonth;
    const future = !past && !active;

    const cells = list(OVERVIEW_COLUMNS).map((column, colKey) => {
      return map({
        text: tableData.getIn([colKey, key]).toString()
      });
    });

    return map({ cells, past, active, future });
  }));

  return rows;
};

/**
 * Called when data is first loaded
 * @param {object} raw: api JSON data
 * @returns {Map} immutable data for the store and view
 */
export default raw => {
  const data = rProcessDataOverview(raw);
  const rows = rGetOverviewRows(data);

  // this gets inserted into the "page" array of the store
  return map({ data, rows });
};

