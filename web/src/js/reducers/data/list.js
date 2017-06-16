/**
 * Process list data
 */

import { List as list, Map as map } from 'immutable';
import { YMD } from '../../misc/date';

export const processPageDataFood = raw => {
  const numRows = raw.data.length;
  const numCols = 5; // date, item, category, cost, shop
  const total = raw.total;

  const data = map({
    numRows,
    numCols,
    total
  });

  const rows = list(raw.data.map(item => {
    return map({
      id: item.I,
      cols: list([
        new YMD(item.d),
        item.i,
        item.k,
        item.c,
        item.s
      ])
    });
  }));

  return map({ data, rows });
};

